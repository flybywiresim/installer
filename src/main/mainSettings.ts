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
};

const store = new Store({ schema, clearInvalidConfig: true });

export default store;
