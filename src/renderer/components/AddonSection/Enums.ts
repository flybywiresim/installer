export enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    NotInstalled,
    GitInstall,
    TrackSwitch,
    InstallingDependency,
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

export const InstallingInstallStatuses = [
    InstallStatus.Downloading,
    InstallStatus.DownloadPrep,
    InstallStatus.InstallingDependency,
    InstallStatus.Decompressing,
    InstallStatus.DownloadEnding,
    InstallStatus.DownloadRetry,
];

export const InstalledInstallStatuses = [
    InstallStatus.UpToDate,
    InstallStatus.NeedsUpdate,
    InstallStatus.TrackSwitch,
    InstallStatus.DownloadDone,
];

export enum ApplicationStatus {
    Open,
    Closed,
    Checking,
}
