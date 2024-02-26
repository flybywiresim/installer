import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import net from 'net';
import { Resolver } from 'renderer/utils/Resolver';

export class ExternalApps {
  static forAddon(addon: Addon, publisher: Publisher): ExternalApplicationDefinition[] {
    return (
      addon.disallowedRunningExternalApps?.map((reference) => {
        const def = Resolver.findDefinition(reference, publisher);

        if (def.kind !== 'externalApp') {
          throw new Error(`definition (key=${def.key}) has kind=${def.kind}, expected kind=externalApp`);
        }

        return def;
      }) ?? []
    );
  }

  static async determineStateWithWS(app: ExternalApplicationDefinition): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const wbs = new WebSocket(app.url);

        wbs.addEventListener('open', () => resolve(true));
        wbs.addEventListener('error', () => resolve(false));
      } catch (e) {
        reject(new Error('Error while establishing WS external app state, see exception above'));
        console.error(e);
      }
    });
  }

  static async determineStateWithHttp(app: ExternalApplicationDefinition): Promise<boolean> {
    return new Promise((resolve) => {
      fetch(app.url)
        .then((resp) => {
          resolve(resp.status === 200);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  static async determineStateWithTcp(app: ExternalApplicationDefinition): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const socket = net.connect(app.port);

        socket.on('connect', () => {
          resolve(true);
          socket.destroy();
        });
        socket.on('error', () => {
          resolve(false);
          socket.destroy();
        });
      } catch (e) {
        reject(new Error('Error while establishing TCP external app state, see exception above'));
        console.error(e);
      }
    });
  }

  static async kill(app: ExternalApplicationDefinition): Promise<void> {
    if (!app.killUrl) {
      throw new Error('Cannot kill external app if it has no killUrl value');
    }

    return fetch(app.killUrl, { method: app.killMethod ?? 'POST' }).then();
  }
}
