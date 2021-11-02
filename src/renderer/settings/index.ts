import { remote } from "electron";
import fs from "fs";
import walk from "walkdir";
import readLine from "readline";
import settings from "common/settings";

const { app } = remote;

export async function configureInitialInstallPath(): Promise<string> {
    let userPath = null;

    const steamMsfsPath = app.getPath('appData') + "\\Microsoft Flight Simulator\\UserCfg.opt";
    const msStoreMsfsPath = app.getPath('home') + "\\AppData\\Local\\Packages\\Microsoft.FlightSimulator_8wekyb3d8bbwe\\LocalCache\\UserCfg.opt";

    if (fs.existsSync(steamMsfsPath)) {
        userPath = steamMsfsPath;
    } else if (fs.existsSync(msStoreMsfsPath)) {
        userPath = msStoreMsfsPath;
    } else {
        walk(app.getPath('home') + "\\AppData\\Local\\", (path) => {
            if (path.includes("Flight") && path.includes("UserCfg.opt")) {
                userPath = path;
            }
        });
    }

    if (userPath) {
        const msfsConfig = fs.createReadStream(userPath.toString());

        return new Promise((resolve) => {
            readLine.createInterface(msfsConfig).on('line', (line) => {
                if (line.includes("InstalledPackagesPath")) {
                    const splitLine = line.split(" ");
                    const combineSplit = splitLine.slice(1).join(" ");
                    const dir = combineSplit.replaceAll('"', '');
                    const msfs_community_path = dir + "\\Community\\";

                    settings.set('mainSettings.msfsPackagePath', msfs_community_path);
                    settings.set('mainSettings.liveriesPath', msfs_community_path);

                    resolve(msfs_community_path);
                }
            });
        });
    } else {
        throw new Error('no path found');
    }
}
