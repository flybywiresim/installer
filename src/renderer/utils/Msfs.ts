import net from 'net';

export class Msfs {
  static async isRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.connect(500);

      socket.on('connect', () => {
        resolve(true);
        socket.destroy();
      });
      socket.on('error', () => {
        resolve(false);
        socket.destroy();
      });
    });
  }
}
