export default {
    window: {
        minimize: 'window/minimize',
        maximize: 'window/maximize',
        close: 'window/close',
        isMaximized: 'window/isMaximized',
    },
    update: {
        error: 'update/error',
        available: 'update/available',
        downloaded: 'update/downloaded',
    },
    checkForInstallerUpdate: 'checkForInstallerUpdate',
    installManager: {
        fragmenterEvent: 'installManager/fragmenterEvent',
        installFromUrl: 'installManager/installFromUrl',
        cancelInstall: 'installManager/cancelInstall',
        uninstall: 'installManager/uninstall',
    },
    sentry: {
        requestSessionID: 'sentry/requestSessionID',
        provideSessionID: 'sentry/provideSessionID',
    },
    openPath: 'openPath',
    msfsBasePathSelectionDialog: 'msfsBasePathSelectionDialog',
};
