Set objArgs = WScript.Arguments

InputFolder = objArgs(0)
ZipFile = objArgs(1)

ArchiveFolder InputFolder, ZipFile

Sub ArchiveFolder (InputFolder, ZipFile)

    With CreateObject("Scripting.FileSystemObject")
        ZipFile = .GetAbsolutePathName(ZipFile)
        InputFolder = .GetAbsolutePathName(InputFolder)

        With .CreateTextFile(ZipFile, True)
            .Write Chr(80) & Chr(75) & Chr(5) & Chr(6) & String(18, chr(0))
        End With
    End With

    With CreateObject("Shell.Application")
        .NameSpace(ZipFile).CopyHere .NameSpace(InputFolder).Items

        Do Until .NameSpace(ZipFile).Items.Count = _
                 .NameSpace(InputFolder).Items.Count
            WScript.Sleep 1000 
        Loop
    End With

End Sub