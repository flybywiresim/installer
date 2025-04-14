import React, { FC } from 'react';
import { ButtonType } from 'renderer/components/Button';
import { SidebarButton } from 'renderer/components/AddonSection/index';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';
import { InstallState } from 'renderer/redux/features/installStatus';

interface ActiveInstallButtonProps {
  installState: InstallState;
  onInstall: () => void;
  onCancel: () => void;
}

export const MainActionButton: FC<ActiveInstallButtonProps> = ({
  installState: { status: installStatus },
  onInstall,
  onCancel,
}): JSX.Element => {
  switch (installStatus) {
    case InstallStatus.DownloadDone:
    case InstallStatus.UpToDate:
      return (
        <SidebarButton disabled type={ButtonType.Positive}>
          Installed
        </SidebarButton>
      );
    case InstallStatus.NeedsUpdate:
      return (
        <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
          Update
        </SidebarButton>
      );
    case InstallStatus.NotInstalled:
      return (
        <SidebarButton type={ButtonType.Positive} onClick={onInstall}>
          Install
        </SidebarButton>
      );
    case InstallStatus.GitInstall:
      return (
        <SidebarButton disabled type={ButtonType.Positive} onClick={onInstall}>
          Installed (git)
        </SidebarButton>
      );
    case InstallStatus.TrackSwitch:
      return (
        <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
          Switch Version
        </SidebarButton>
      );
    case InstallStatus.InstallingDependency:
    case InstallStatus.Downloading:
    case InstallStatus.Decompressing:
      return (
        <SidebarButton type={ButtonType.Danger} onClick={onCancel}>
          Cancel
        </SidebarButton>
      );
    case InstallStatus.DownloadPending:
    case InstallStatus.DownloadPrep:
    case InstallStatus.DownloadEnding:
    case InstallStatus.InstallingDependencyEnding:
      return (
        <SidebarButton disabled type={ButtonType.Neutral}>
          Cancel
        </SidebarButton>
      );
    case InstallStatus.DownloadCanceled:
      return (
        <SidebarButton disabled type={ButtonType.Neutral}>
          Cancelled
        </SidebarButton>
      );
    case InstallStatus.DownloadRetry:
    case InstallStatus.DownloadError:
    case InstallStatus.Unknown:
      return (
        <SidebarButton disabled type={ButtonType.Neutral}>
          Error
        </SidebarButton>
      );
    default:
      return <></>;
  }
};
