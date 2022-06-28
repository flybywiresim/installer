import { ExternalApplicationDefinition } from "renderer/utils/InstallerConfiguration";
import net from 'net';

export class ExternalApps {
    static async determineStateWithWS(app: ExternalApplicationDefinition): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(app.url);

                ws.addEventListener('open', () => resolve(true));
                ws.addEventListener('error', () => resolve(false));
            } catch (e) {
                reject(new Error('Error while establishing WS external app state, see exception above'));
                console.error(e);
            }
        });
    }

    static async determineStateWithHttp(app: ExternalApplicationDefinition): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                fetch(app.url).then((resp) => {
                    resolve(resp.status === 200);
                }).catch(() => resolve(false));
            } catch (e) {
                reject(new Error('Error while establishing HTTP external app state, see exception above'));
                console.error(e);
            }
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
