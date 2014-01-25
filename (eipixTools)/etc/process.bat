@echo off
title Please Wait

set etcpath=%~dp0

set pm="%etcpath%procmon.exe"
set config="%etcpath%elemconfig.pmc"
set backing="%userprofile%\desktop\afterfx.pml"
set saving="%userprofile%\desktop\afterfx.csv"
set terminateProc="%userprofile%\desktop\terminateProcess.txt"

IF EXIST %saving% (del %saving%)
IF EXIST %backing% (del %backing%)
IF EXIST %terminateProc% (del %terminateProc%)

echo Starting Process Monitor
echo   - loading configuration and filter from %config%
echo   - logging to file %backing%

start "" /b %pm% /accepteula /quiet /minimized /backingfile %backing% /loadconfig %config%

%pm% /waitforidle
afterfx.exe

:file_check
IF EXIST %terminateProc% (GOTO file_exists) ELSE (PING 127.0.0.1 -w 1000 -n 10 >NUL)
GOTO file_check

:file_exists
%pm% /terminate
%pm% /openlog %backing% /saveas %saving%

rem ----------process csv

del %backing%
del %terminateProc%

afterfx.exe -s "alert("Gathering done. If you got an error, tough luck.")"

title Done
echo Done

:eof