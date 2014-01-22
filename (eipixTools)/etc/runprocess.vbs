Option Explicit
Dim fso, objShell, oShell
Set fso = CreateObject ("Scripting.FileSystemObject")
Set objShell = WScript.CreateObject("WScript.Shell")
Set oShell = CreateObject("Shell.Application")

Dim appDir, processFile
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
processFile = appDir & "\process.bat"

oShell.ShellExecute """" & processFile & """", , , "runas", 1