@echo off
title Please Wait

set etcpath=%~dp0
set pm="%etcpath%procmon.exe"

set config_seq="%etcpath%elemconfig_seq.pmc"
set backing_seq="%userprofile%\desktop\afterfx_seq.pml"
set saving_seq="%userprofile%\desktop\afterfx_seq.csv"
set terminateProc_seq="%userprofile%\desktop\terminateProcess_seq.txt"

if EXIST %saving% (del %saving_seq%)
if EXIST %backing% (del %backing_seq%)
if EXIST %terminateProc% (del %terminateProc_seq%)

echo Starting Process Monitor
echo   - loading configuration and filter
echo   - logging to file

start "" /b %pm% /accepteula /quiet /minimized /backingfile %backing_seq% /loadconfig %config_seq%
    
%pm% /waitforidle
afterfx.exe
    
:file_check_seq
if EXIST %terminateProc_seq% (goto file_exists_seq) else (PING 127.0.0.1 -w 1000 -n 10 >NUL)
goto file_check_seq
    
:file_exists_seq
%pm% /terminate
%pm% /openlog %backing_seq% /saveas %saving_seq%

del %backing_seq%
del %terminateProc_seq%

afterfx.exe

title Done
echo Done

:eof