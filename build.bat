@echo off

call .venv\Scripts\activate.bat
pyinstaller toolboy_install.spec
