@echo off

call .venv\Scripts\activate.bat
pyinstaller afterbox_setup.spec
