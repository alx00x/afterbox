@echo off
title Please Wait

set etcpath=%~dp0
set pm="%etcpath%procmon.exe"

set config="%etcpath%elemconfig.pmc"
set backing="%userprofile%\desktop\afterfx.pml"
set saving="%userprofile%\desktop\afterfx.csv"
set terminateProc="%userprofile%\desktop\terminateProcess.txt"
    
if EXIST %saving% (del %saving%)
if EXIST %backing% (del %backing%)
if EXIST %terminateProc% (del %terminateProc%)
    
echo Starting Process Monitor
echo   - loading configuration and filter
echo   - logging to file
    
start "" /b %pm% /accepteula /quiet /minimized /backingfile %backing% /loadconfig %config%
    
%pm% /waitforidle
afterfx.exe
    
:file_check
if EXIST %terminateProc% (goto file_exists) else (PING 127.0.0.1 -w 1000 -n 10 >NUL)
goto file_check
    
:file_exists
%pm% /terminate
%pm% /openlog %backing% /saveas %saving%
    
del %backing%
del %terminateProc%

afterfx.exe

title Done
echo Done

:eof