import { ipcMain } from 'electron';
import fs from 'fs';
import * as Sentry from '@sentry/electron/main';
import { customAlphabet } from 'nanoid';
import packageJson from '../../package.json';
import channels from 'common/channels';
import path from 'path';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SESSION_ID_LENGTH = 14;

export class SentryClient {
  static initialize(): void {
    const nanoid = customAlphabet(ALPHABET, SESSION_ID_LENGTH);
    const generatedSessionID = nanoid();

    let dsn;
    try {
      const extraResourcesPath = import.meta.env.PROD
        ? path.join(process.resourcesPath, 'extraResources')
        : 'extraResources';

      dsn = fs.readFileSync(path.join(extraResourcesPath, '.sentrydsn'), { encoding: 'utf-8' });
    } catch (e) {
      console.error('Could not read extraResources/sentry.json. See exception below');
      console.error(e);
    }

    if (!dsn) {
      console.warn('Sentry not initialized - dsn not loaded');

      // Send an <unavailable> session ID when requested
      ipcMain.handle(channels.sentry.requestSessionID, () => {
        return '<unavailable>';
      });

      return;
    }

    // Send the session ID when requested
    ipcMain.handle(channels.sentry.requestSessionID, () => {
      return generatedSessionID;
    });

    Sentry.setTag('session.id', generatedSessionID);

    Sentry.init({
      dsn,
      release: packageJson.version,
      // sampleRate: 0.1,
    });

    console.log('Sentry initialized');
  }
}
