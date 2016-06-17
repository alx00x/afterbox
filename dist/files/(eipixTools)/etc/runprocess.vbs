Option Explicit
Dim fso, objShell, oShell
Set fso = CreateObject ("Scripting.FileSystemObject")
Set objShell = WScript.CreateObject("WScript.Shell")
Set oShell = CreateObject("Shell.Application")

Dim appDir, processFile, processFile_seq
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
processFile = appDir & "\process.bat"
processFile_seq = appDir & "\process_seq.bat"

Dim args, arg0, sequence
Set args = WScript.Arguments
arg0 = args.Item(0)
If arg0 = "false" Then
    oShell.ShellExecute """" & processFile & """", , , "runas", 1
Else
    oShell.ShellExecute """" & processFile_seq & """", , , "runas", 1
End If