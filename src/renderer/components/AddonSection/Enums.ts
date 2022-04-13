export enum InstallStatus {
    UpToDate,
    NeedsUpdate,
    NotInstalled,
    GitInstall,
    TrackSwitch,
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

export enum MsfsStatus {
    Open,
    Closed,
    Checking,
}
