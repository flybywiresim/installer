import Store from "electron-store";
import path from "path";

const settings = new Store;

export class Directories {

    static inCommunity(targetDir: string): string {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, targetDir);
    }

    static temp(): string {
        return path.join(settings.get('mainSettings.msfsPackagePath') as string, `flybywire_current_install_${(Math.random() * 1000).toFixed(0)}`);
    }

}
