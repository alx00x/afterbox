import os
import sys
import time
import shutil
import winreg
import logging
import pathlib
import subprocess
from PySide2 import QtCore, QtGui, QtWidgets


def resource(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)


VERSION = "5.0"
WINDOW_TITLE = "Install"
WINDOW_OBJECT = "toolboy_window"

# ------------------------------------------------------------------------------
# Logging


class Handler(logging.Handler):

    def __init__(self, widget):
        logging.Handler.__init__(self)
        self.widget = widget
        self.widget.setReadOnly(True)
        self.setFormatter(logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s", "%H:%M:%S"))

    def emit(self, record):
        msg = self.format(record)
        print(msg)
        self.widget.appendPlainText(msg)
        self.widget.verticalScrollBar().setValue(self.widget.verticalScrollBar().maximum())
        QtCore.QCoreApplication.processEvents()

# ------------------------------------------------------------------------------
# Helper Widgets


class QHLine(QtWidgets.QFrame):
    def __init__(self):
        super(QHLine, self).__init__()
        self.setFrameShape(QtWidgets.QFrame.HLine)
        self.setFrameShadow(QtWidgets.QFrame.Sunken)


class QVLine(QtWidgets.QFrame):
    def __init__(self):
        super(QVLine, self).__init__()
        self.setFrameShape(QtWidgets.QFrame.VLine)
        self.setFrameShadow(QtWidgets.QFrame.Sunken)


class QHSpacer(QtWidgets.QSpacerItem):
    def __init__(self):
        super(QHSpacer, self).__init__(0, 0, QtWidgets.QSizePolicy.Expanding,
                                       QtWidgets.QSizePolicy.Minimum)


class QVSpacer(QtWidgets.QSpacerItem):
    def __init__(self):
        super(QVSpacer, self).__init__(0, 0, QtWidgets.QSizePolicy.Minimum,
                                       QtWidgets.QSizePolicy.Expanding)


# ------------------------------------------------------------------------------
# Main Class

class Window(QtWidgets.QDialog):
    def __init__(self, parent=None):
        super(Window, self).__init__(parent)

        self.setWindowTitle(WINDOW_TITLE)
        self.setObjectName(WINDOW_OBJECT)
        self.setAcceptDrops(False)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap(resource("res/icon.png")),
                       QtGui.QIcon.Normal, QtGui.QIcon.Off)
        self.setWindowIcon(icon)

        self.data = dict()
        self.setupUI()

        # Logging
        self._handler = Handler(self.data["widget"]["logger"])
        self._logger = logging.getLogger(__name__)
        self._logger.propagate = True
        self._logger.addHandler(self._handler)
        self._logger.setLevel(logging.INFO)

        self.initialize()

        self.setFixedSize(400, 300)

    @property
    def logger(self):
        return self._logger

    @logger.setter
    def logger(self, logger_obj):
        self._logger = logger_obj

    @property
    def handler(self):
        return self._handler

    @handler.setter
    def handler(self, handler_obj):
        self._handler = handler_obj

    def setupUI(self):
        # Master Layout --------------------------------------------------------

        master_layout = QtWidgets.QVBoxLayout(self)

        # Master Stack ---------------------------------------------------------

        master_stack = QtWidgets.QStackedWidget(self)

        # Main Frame -----------------------------------------------------------

        main_frame = QtWidgets.QWidget(self)
        main_frame_layout = QtWidgets.QVBoxLayout(main_frame)

        banner = QtWidgets.QLabel(self)
        banner.setPixmap(QtGui.QPixmap(resource("res/header.png")))

        chooser_layout = QtWidgets.QVBoxLayout()
        chooser_label = QtWidgets.QLabel(self)
        chooser_label.setText("Choose your After Effects version:")

        chooser_list = QtWidgets.QComboBox(self)

        chooser_layout.addWidget(chooser_label)
        chooser_layout.addWidget(chooser_list)
        chooser_layout.setContentsMargins(30, 20, 30, 20)

        main_frame_layout.addWidget(banner)
        main_frame_layout.addLayout(chooser_layout)
        main_frame_layout.addStretch()
        main_frame_layout.setContentsMargins(0, 0, 0, 0)

        # Logger Frame ---------------------------------------------------------

        logger_frame = QtWidgets.QFrame(self)
        logger_frame_layout = QtWidgets.QVBoxLayout(logger_frame)

        status_label = QtWidgets.QLabel(self)
        status_label.setFixedHeight(5)
        status_label.setStyleSheet("background: #CCCCCC")

        logger_widget = QtWidgets.QPlainTextEdit(self)
        logger_widget_policy = QtWidgets.QSizePolicy(
            QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Expanding)
        logger_widget_policy.setVerticalStretch(1)
        logger_widget.setSizePolicy(logger_widget_policy)

        logger_frame_layout.addWidget(status_label)
        logger_frame_layout.addWidget(logger_widget)

        # Footer ---------------------------------------------------------------

        footer_frame = QtWidgets.QWidget(self)
        footer_layout = QtWidgets.QHBoxLayout(footer_frame)

        version_label = QtWidgets.QLabel(self)
        version_label.setText("v" + VERSION)
        version_label.setStyleSheet("color: rgba(0, 0, 0, 50%)")

        button_install = QtWidgets.QPushButton(self)
        button_install.setText("Install")
        button_exit = QtWidgets.QPushButton(self)
        button_exit.setText("Exit")

        footer_layout.addWidget(version_label)
        footer_layout.addItem(QHSpacer())
        footer_layout.addWidget(button_install)
        footer_layout.addWidget(button_exit)
        footer_layout.setContentsMargins(10, 10, 10, 10)

        # ----------------------------------------------------------------------

        # Master Stack
        master_stack.addWidget(main_frame)
        master_stack.addWidget(logger_frame)

        # Master Layout
        master_layout.addWidget(master_stack)
        master_layout.addWidget(QHLine())
        master_layout.addWidget(footer_frame)
        master_layout.setSpacing(0)
        master_layout.setContentsMargins(0, 0, 0, 0)

        # ----------------------------------------------------------------------
        # Data
        self.data = {
            "stack": {
                "master": master_stack,
            },
            "label": {
                "version": version_label,
                "status": status_label,
            },
            "widget": {
                "logger": logger_widget,
                "chooser": chooser_list,
            },
            "button": {
                "install": button_install,
                "exit": button_exit,
            },
        }

        # Signals
        self.data["button"]["install"].clicked.connect(
            self.on_install_clicked)
        self.data["button"]["exit"].clicked.connect(
            self.on_exit_clicked)

    def initialize(self):
        self.logger.info("Finding installed After Effects versions...")

        chooser = self.data["widget"]["chooser"]
        ae_paths = list()
        key_val = r"Software\\Adobe\\After Effects"
        a_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_val, 0,
                               winreg.KEY_WOW64_64KEY | winreg.KEY_READ)
        try:
            i = 0
            while True:
                asubkey = winreg.EnumKey(a_key, i)
                key_val_version = key_val + "\\" + asubkey
                h_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_val_version, 0,
                                       winreg.KEY_WOW64_64KEY | winreg.KEY_READ)
                value, _ = winreg.QueryValueEx(h_key, "InstallPath")
                ae_paths.append(value)
                i += 1
        except WindowsError:
            pass

        find_string = "Adobe After Effects"
        for ae_path in ae_paths:
            start_at = ae_path.find(find_string)
            end_at = ae_path.find("\\", start_at)
            ae_version = ae_path[start_at:end_at]

            self.logger.info("Found version '%s'", ae_version)

            chooser.addItem(ae_version, userData=ae_path)

        self.logger.info("Initialization complete.")

    def on_install_clicked(self):
        stack = self.data["stack"]["master"]
        stack.setCurrentIndex(1)

        QtCore.QCoreApplication.processEvents()
        self.logger.info("...")
        time.sleep(.5)

        chooser = self.data["widget"]["chooser"]
        install_path = chooser.itemData(chooser.currentIndex())

        install_path = os.path.join(install_path, "Scripts", "ScriptUI Panels")
        if not os.path.isdir(install_path):
            self.logger.error("Path does not exist: %s", install_path)
            return

        self.data["button"]["install"].setEnabled(False)
        install = self._install(install_path)

        if install:
            self.data["label"]["status"].setStyleSheet("background: #009CFF;")
            self.logger.info("Installation successful!")
        else:
            self.data["label"]["status"].setStyleSheet("background: #FF0000;")
            self.logger.error("Installation failed.")

    def _install(self, destination):
        self.logger.info("Installing at '%s'", destination)

        files = list(pathlib.Path(resource("files")).rglob("*.*"))
        files_destination_root = destination + "/(toolboy)"
        script_destination = destination + "/toolboy.jsx"

        perm_script = resource("res/permissions.vbs")
        try:

            if os.path.isdir(files_destination_root):
                self.logger.info("Removing folder: %s", files_destination_root)
                shutil.rmtree(files_destination_root)

            if os.path.isfile(script_destination):
                self.logger.info("Removing file: %s", script_destination)
                os.remove(script_destination)

            for each in files:
                _, f = each.as_posix().split("/files/")
                dest = pathlib.Path(destination, f)

                if not os.path.exists(os.path.dirname(dest)):
                    self.logger.info("Creating direcotry: %s", os.path.dirname(dest))
                    os.makedirs(os.path.dirname(dest))

                self.logger.info("Copying file: %s", each.name)
                shutil.copyfile(each, dest)

            self.logger.info("Setting permissions...")
            no_window = 0x08000000
            subprocess.call("cscript \"" + perm_script + "\"" + " " +
                            "\"" + files_destination_root + "\"", creationflags=no_window)
        except Exception as err:
            self.logger.error(err)
            return False

        return True

    def on_exit_clicked(self):
        self.logger.info("Exiting..")
        self.close()


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    win = Window()
    win.show()
    sys.exit(app.exec_())
