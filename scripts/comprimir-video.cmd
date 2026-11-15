@echo off
rem Lanza comprimir-video.ps1 aunque Windows tenga bloqueados los scripts de PowerShell.
rem Uso: scripts\comprimir-video.cmd material\marcas\video.mp4
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0comprimir-video.ps1" %*
exit /b %ERRORLEVEL%
