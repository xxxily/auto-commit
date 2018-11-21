@echo off

rem ----- goto working directory -----
%~d0
cd %~dp0

echo STEP-1: install node modules ...
goto installPackage

rem ----- install node modules and run build -----
:installPackage
call npm install
goto run

rem ----- run auto commit command -----
:run
echo STEP-2: run auto
call npm run auto
pause
