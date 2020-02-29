Dim intOptions, objShell, objSource, objTarget

Set objArgs = WScript.Arguments
ZipFile = objArgs(0)
OutputFolder = objArgs(1)

Set objShell = CreateObject( "Shell.Application" )
Set objSource = objShell.NameSpace(ZipFile).Items()
Set objTarget = objShell.NameSpace(OutputFolder)
intOptions = 256
objTarget.CopyHere objSource, intOptions

Set intOptions = Nothing
Set objSource = Nothing
Set objTarget = Nothing
Set objShell  = Nothing