export enum InstallStatus {
  UpToDate,
  NeedsUpdate,
  NotInstalled,
  GitInstall,
  TrackSwitch,
  InstallingDependency,
  InstallingDependencyEnding,
  DownloadPending,
  DownloadPrep,
  Downloading,
  Decompressing,
  DownloadEnding,
  DownloadDone,
  DownloadRetry,
  DownloadError,
  DownloadCanceled,
  Unknown,
  Hidden,
}

export const InstallStatusCategories = {
  installing: [
    InstallStatus.DownloadPending,
    InstallStatus.Downloading,
    InstallStatus.DownloadPrep,
    InstallStatus.InstallingDependency,
    InstallStatus.InstallingDependencyEnding,
    InstallStatus.Decompressing,
    InstallStatus.DownloadRetry,
    InstallStatus.DownloadEnding,
  ],
  installingNoProgress: [
    InstallStatus.DownloadPrep,
    InstallStatus.DownloadPending,
    InstallStatus.DownloadRetry,
    InstallStatus.DownloadEnding,
  ],
  installingDependency: [InstallStatus.InstallingDependency, InstallStatus.InstallingDependencyEnding],
  installed: [InstallStatus.UpToDate, InstallStatus.NeedsUpdate, InstallStatus.TrackSwitch, InstallStatus.DownloadDone],
  installOrUpdatePending: [InstallStatus.NeedsUpdate, InstallStatus.NotInstalled, InstallStatus.TrackSwitch],
};

export enum ApplicationStatus {
  Open,
  Closed,
  Checking,
}
