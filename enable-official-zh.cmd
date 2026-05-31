@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
where node.exe >nul 2>nul
if %ERRORLEVEL%==0 (
  node.exe "%SCRIPT_DIR%enable-official-zh.js" %*
) else (
  for /d %%D in ("C:\Program Files\WindowsApps\OpenAI.Codex_*_x64__2p2nqsd0c76g0") do (
    if exist "%%D\app\resources\node.exe" (
      "%%D\app\resources\node.exe" "%SCRIPT_DIR%enable-official-zh.js" %*
      goto :done
    )
  )
  echo node.exe was not found.
  exit /b 1
)
:done
endlocal
