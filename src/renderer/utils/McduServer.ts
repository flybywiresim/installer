import WebSocket from 'ws';

export class McduServer {
    static async isRunning(): Promise<boolean> {
        return new Promise((resolve) => {
            const McduServerPort = 8380;

            const url = `ws://127.0.0.1:${McduServerPort}`;

            const socket = new WebSocket(url);

            socket.onerror = () => {
                resolve(false);
                socket.close();
            };

            socket.onopen = () => {
                resolve(true);
                socket.close();
            };

        });
    }

}
