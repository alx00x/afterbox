Option Explicit
Dim fso, objShell, oShell
Set fso = CreateObject ("scripting.filesystemobject")
Set objShell = WScript.CreateObject("WScript.Shell")
Set oShell = CreateObject("Shell.Application")

Dim appDir, processFile
appDir = objShell.CurrentDirectory
processFile = appDir & "\Scripts\ScriptUI Panels\(eipixTools)\etc\process.bat"

oShell.ShellExecute """" & processFile & """", , , "runas", 1