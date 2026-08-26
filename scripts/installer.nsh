!macro customInit
  ${ifNot} ${isUpdated}
    nsExec::Exec '"$LOCALAPPDATA\fbw_installer\Update.exe" --uninstall -s'
    delete "$LOCALAPPDATA\fbw_installer\Update.exe"
    delete "$LOCALAPPDATA\fbw_installer\.dead"
    rmDir "$LOCALAPPDATA\fbw_installer"
  ${endIf}
  IfFileExists "$LOCALAPPDATA\Programs\fbw-installer\Uninstall FlyByWire Installer.exe" 0 +2
  ExecWait '"$LOCALAPPDATA\Programs\fbw-installer\Uninstall FlyByWire Installer.exe" /S'
!macroend