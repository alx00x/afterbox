# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'eipixTools_install.ui'
#
# Created: Sun Jan 04 22:21:11 2015
#      by: pyside-uic 0.2.15 running on PySide 1.2.2
#
# WARNING! All changes made in this file will be lost!
import os, sys, shutil, _winreg, subprocess
from PySide import QtCore, QtGui

ae_paths = []
ae_versions = []
keyVal = r"Software\\Adobe\\After Effects"
aKey = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, keyVal, 0, _winreg.KEY_WOW64_64KEY | _winreg.KEY_READ)
try:
    i = 0
    while True:
        asubkey = _winreg.EnumKey(aKey, i)
        keyValVersion = keyVal + "\\" + asubkey
        hKey = _winreg.OpenKey(_winreg.HKEY_LOCAL_MACHINE, keyValVersion, 0, _winreg.KEY_WOW64_64KEY | _winreg.KEY_READ)
        value, type = _winreg.QueryValueEx(hKey, "InstallPath")
        ae_paths.append(value)
        i += 1
except WindowsError:
    pass

find_string = "Adobe After Effects"
for item in ae_paths:
    start_at = item.find(find_string);
    end_at = item.find("\\", start_at);
    ae_versions.append(item[start_at:end_at])

ae_dict = {}
for i in range(len(ae_versions)):
    ae_dict[ae_versions[i]] = ae_paths[i] + "Scripts\\ScriptUI Panels"

class Ui_dialog(object):
    def setupUi(self, dialog):
        dialog.setObjectName("dialog")
        dialog.resize(400, 300)
        dialog.setAcceptDrops(False)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap("img/icon.png"), QtGui.QIcon.Normal, QtGui.QIcon.Off)
        dialog.setWindowIcon(icon)
        self.button_box = QtGui.QDialogButtonBox(dialog)
        self.button_box.setGeometry(QtCore.QRect(30, 260, 341, 32))
        self.button_box.setOrientation(QtCore.Qt.Horizontal)
        self.button_box.setStandardButtons(QtGui.QDialogButtonBox.Cancel|QtGui.QDialogButtonBox.Ok)
        self.button_box.setCenterButtons(False)
        self.button_box.setObjectName("button_box")
        self.list_box = QtGui.QComboBox(dialog)
        self.list_box.setGeometry(QtCore.QRect(30, 200, 341, 22))
        self.list_box.setAcceptDrops(False)
        self.list_box.setEditable(False)
        self.list_box.setObjectName("list_box")
        for a in range(len(ae_dict)):
            self.list_box.addItem("")
        self.line = QtGui.QFrame(dialog)
        self.line.setGeometry(QtCore.QRect(0, 240, 401, 20))
        self.line.setFrameShape(QtGui.QFrame.HLine)
        self.line.setFrameShadow(QtGui.QFrame.Sunken)
        self.line.setObjectName("line")
        self.text_label = QtGui.QLabel(dialog)
        self.text_label.setGeometry(QtCore.QRect(30, 170, 341, 16))
        self.text_label.setObjectName("text_label")
        self.header_label = QtGui.QLabel(dialog)
        self.header_label.setGeometry(QtCore.QRect(0, 0, 400, 150))
        self.header_label.setText("")
        self.header_label.setPixmap(QtGui.QPixmap("img/header.png"))
        self.header_label.setObjectName("header_label")

        self.retranslateUi(dialog)
        QtCore.QObject.connect(self.button_box, QtCore.SIGNAL("accepted()"), self.accept)
        QtCore.QObject.connect(self.button_box, QtCore.SIGNAL("rejected()"), dialog.reject)
        QtCore.QMetaObject.connectSlotsByName(dialog)

    def retranslateUi(self, dialog):
        dialog.setWindowTitle(QtGui.QApplication.translate("dialog", "Install", None, QtGui.QApplication.UnicodeUTF8))
        for x in range(len(ae_dict)):
            self.list_box.setItemText(x, QtGui.QApplication.translate("dialog", str(ae_dict.keys()[x]), None, QtGui.QApplication.UnicodeUTF8))
        self.text_label.setText(QtGui.QApplication.translate("dialog", "Choose your After Effects version:", None, QtGui.QApplication.UnicodeUTF8))

    def accept(self):
        user_choice = self.list_box.currentText()
        install_path = ae_dict[user_choice]
        install_tools_path = install_path + "\\(eipixTools)"
        install_script_path = install_path + "\\eipixTools.jsx"
        files_path = os.getcwd() + "\\files"
        tools_path = os.getcwd() + "\\files\\(eipixTools)"
        script_path = os.getcwd() + "\\files\\eipixTools.jsx"
        perm_script_path = os.getcwd() + "\\misc\\permissions.vbs"
        try:
            if os.path.exists(install_tools_path):
                shutil.rmtree(install_tools_path)
            shutil.copytree(tools_path, install_tools_path)
            subprocess.call("cscript \"" + perm_script_path + "\"" + " " + "\"" + install_tools_path + "\"")
            if os.path.isfile(install_script_path):
                os.remove(install_script_path)
            shutil.copy(script_path, install_path)
        except:
            print "Something went wrong."
        dialog.close()

if __name__ == "__main__":
    import sys
    app = QtGui.QApplication(sys.argv)
    dialog = QtGui.QDialog()
    ui = Ui_dialog()
    ui.setupUi(dialog)
    dialog.show()
    sys.exit(app.exec_())