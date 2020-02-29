Dim objShell, intRunError
Set objArgs = WScript.Arguments

strFolders = objArgs(0)
strNTGroup = "Users"

Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("Wscript.Shell")

If objFSO.FolderExists(strFolders) Then
    intRunError = objShell.Run("%COMSPEC% /c Echo Y| cacls """ & strFolders & """ /T /E /C /G " & strNTGroup & ":C", 2, True)
    If intRunError < 0 Then
        Wscript.Echo "Error assigning permissions for users to folder: " & strFolders
    End If
Else
    Wscript.Echo "Folder " & strFolders & " does not exist."
End If

Set objFSO = Nothing
Set objShell = Nothing