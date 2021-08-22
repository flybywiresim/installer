!macro customInit
  ${ifNot} "$EXEPATH" == "$TEMP\fbw-installer\setup.exe"
    CopyFiles "$EXEPATH" "$TEMP\fbw-installer\setup.exe"
    Exec "$TEMP\fbw-installer\setup.exe"
    quit
  ${else}
    nsExec::Exec '"$LOCALAPPDATA\fbw_installer\Update.exe" --uninstall -s'
    delete "$LOCALAPPDATA\fbw_installer\Update.exe"
    delete "$LOCALAPPDATA\fbw_installer\.dead"
    rmDir "$LOCALAPPDATA\fbw_installer"
  ${endIf}
!macroend