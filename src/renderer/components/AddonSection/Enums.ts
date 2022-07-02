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

export const InstallStatusCategories = {
    installing: [
        InstallStatus.Downloading,
        InstallStatus.DownloadPrep,
        InstallStatus.InstallingDependency,
        InstallStatus.Decompressing,
        InstallStatus.DownloadEnding,
        InstallStatus.DownloadRetry,
    ],
    installed: [
        InstallStatus.UpToDate,
        InstallStatus.NeedsUpdate,
        InstallStatus.TrackSwitch,
        InstallStatus.DownloadDone,
    ],
    installOrUpdatePending: [
        InstallStatus.NeedsUpdate,
        InstallStatus.NotInstalled,
        InstallStatus.TrackSwitch,
    ],
};

export enum ApplicationStatus {
    Open,
    Closed,
    Checking,
}
