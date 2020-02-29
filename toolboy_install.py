import os
import sys
import shutil
import winreg
import logging
import subprocess
from PySide2 import QtCore, QtGui, QtWidgets


self = sys.modules[__name__]
self._path = os.path.dirname(__file__)


def resource(*path):
    path = os.path.join(self._path, "res", *path)
    return path.replace("\\", "/")


VERSION = "5.0"
WINDOW_TITLE = "Install"
WINDOW_OBJECT = "toolboy_window"
WINDOW_ICON = resource("icon.png")

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
        icon.addPixmap(QtGui.QPixmap(WINDOW_ICON), QtGui.QIcon.Normal, QtGui.QIcon.Off)
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

        master_stack = QtWidgets.QFrame(self)
        master_stack_layout = QtWidgets.QStackedLayout(master_stack)

        # Main Frame -----------------------------------------------------------

        main_frame = QtWidgets.QWidget(self)
        main_frame_layout = QtWidgets.QVBoxLayout(main_frame)

        banner = QtWidgets.QLabel(self)
        banner.setPixmap(QtGui.QPixmap(resource("header.png")))

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

        logger_frame = QtWidgets.QWidget(self)
        logger_frame_layout = QtWidgets.QVBoxLayout(logger_frame)

        logger_widget = QtWidgets.QPlainTextEdit(self)
        logger_widget_policy = QtWidgets.QSizePolicy(
            QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Expanding)
        logger_widget_policy.setVerticalStretch(1)
        logger_widget.setSizePolicy(logger_widget_policy)

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
        master_stack_layout.addWidget(main_frame)
        master_stack_layout.addWidget(logger_frame)

        # Master Layout
        master_layout.addWidget(master_stack)
        master_layout.addWidget(QHLine())
        master_layout.addWidget(footer_frame)
        master_layout.setSpacing(0)
        master_layout.setContentsMargins(0, 0, 0, 0)

        # ----------------------------------------------------------------------
        # Data
        self.data = {
            "label": {
                "version": version_label,
            },
            "widget": {
                "logger": logger_widget,
                "chooser": chooser_list,
                "logger": logger_widget,
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
        chooser = self.data["widget"]["chooser"]
        install_path = chooser.itemData(chooser.currentIndex())

        self.logger.info("Installing at '%s'", install_path)

    def on_exit_clicked(self):
        self.close()


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    win = Window()
    win.show()
    sys.exit(app.exec_())
