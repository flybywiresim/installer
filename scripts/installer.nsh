!macro customInit
  ${ifNot} ${isUpdated}
    nsExec::Exec '"$LOCALAPPDATA\fbw_installer\Update.exe" --uninstall -s'
    delete "$LOCALAPPDATA\fbw_installer\Update.exe"
    delete "$LOCALAPPDATA\fbw_installer\.dead"
    rmDir "$LOCALAPPDATA\fbw_installer"
  ${endIf}
!macroend