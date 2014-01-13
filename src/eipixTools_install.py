import os
import sys
import shutil
import win32com.client

shell = win32com.client.Dispatch("WScript.Shell")
sysHome = os.path.expanduser('~')

fileSrc = "\\\\192.168.0.200\\c\\tools\\eipixTools_for_AE\\eipixTools.jsx"
fileDest = "C:\\Program Files\\Adobe\\Adobe After Effects CS6\\Support Files\\Scripts\\ScriptUI Panels\\eipixTools.jsx"
try:
    os.remove(fileDest)
except OSError:
    pass
shutil.copyfile(fileSrc, fileDest)  

folderSrc = "\\\\192.168.0.200\\c\\tools\\eipixTools_for_AE\\(eipixTools)\\"
folderDest = "C:\\Program Files\\Adobe\\Adobe After Effects CS6\\Support Files\\Scripts\\ScriptUI Panels\\(eipixTools)\\"
if not os.path.isdir(folderDest):
    os.makedirs(folderDest)
shutil.rmtree(folderDest)
shutil.copytree(folderSrc, folderDest)

shortcut1 = shell.CreateShortCut(sysHome + "\\Desktop\\eipixTools_install.lnk")
shortcut1.Targetpath = "\\\\192.168.0.200\\c\\tools\\eipixTools_for_AE\\eipixTools_install.exe"
shortcut1.WorkingDirectory = "\\\\192.168.0.200\\c\\tools\\eipixTools_for_AE"
shortcut1.save()