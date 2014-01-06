@echo off

set epxsrc="C:\Program Files\Adobe\Adobe After Effects CS6\Support Files\Scripts\ScriptUI Panels\(eipixTools)\src"
set csvpath="C:\"

set pm=%epxsrc%\procmon.exe
set config=%epxsrc%\elemconfig.pmc
set backing=%csvpath%\afterfx.pml
set saving=%csvpath%\afterfx.csv

del %saving%
del %backing%

echo Starting Process Monitor
echo   - loading configuration and filter from %config%
echo   - logging to file %backing%
start "" %pm% /accepteula /quiet /minimized /backingfile %backing% /loadconfig %config%

%pm% /waitforidle
afterfx.exe
pause
%pm% /terminate

%pm% /openlog %backing% /saveas %saving%

rem ----------process csv

del %backing%

echo Done