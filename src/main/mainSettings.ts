import Store, { Schema } from 'electron-store';

export const persistWindowSettings = (window: Electron.BrowserWindow): void => {
  store.set('cache.main.maximized', window.isMaximized());

  const winSize = window.getSize();
  store.set('cache.main.lastWindowX', winSize[0]);
  store.set('cache.main.lastWindowY', winSize[1]);
};

interface Settings {
  cache: {
    main: {
      lastWindowX: number;
      lastWindowY: number;
      maximized: boolean;
    };
  };
  advanced: {
    showAll: boolean;
    disableHardwareAcceleration: boolean;
    disableGpuSandbox: boolean;
    noSandbox: boolean;
  };
}

const schema: Schema<Settings> = {
  cache: {
    type: 'object',
    default: {},
    properties: {
      main: {
        type: 'object',
        default: {},
        properties: {
          lastWindowX: {
            type: 'integer',
          },
          lastWindowY: {
            type: 'integer',
          },
          maximized: {
            type: 'boolean',
            default: false,
          },
        },
      },
    },
  },
  advanced: {
    type: 'object',
    default: {},
    properties: {
      showAll: {
        type: 'boolean',
        default: false,
      },
      disableHardwareAcceleration: {
        type: 'boolean',
        default: false,
      },
      disableGpuSandbox: {
        type: 'boolean',
      },
      noSandbox: {
        type: 'boolean',
      },
    },
  },
};

const store = new Store({ schema, clearInvalidConfig: true });

export default store;
