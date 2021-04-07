import { Directories } from "renderer/utils/Directories";
import * as path from "path";
import { copy, existsSync, readdir, readdirSync, readFile, readFileSync, rename, writeFile } from "fs-extra";
import { ConfigIniParser } from "config-ini-parser";

export type LiveryDefinition = {
    packageName: string,
    simObjectName: string
    title: string,
}

export class LiveryConversion {

    static async getIncompatibleLiveries(): Promise<LiveryDefinition[]> {
        return readdir(Directories.community())
            .then((folders) => folders.map<LiveryDefinition>((folder) => {
                const packageFolder = path.join(Directories.community(), folder);

                console.log(`[LCU] Checking package '${packageFolder}'...`);

                const folderIsValidPackage = existsSync(`${packageFolder}/manifest.json`);

                if (!folderIsValidPackage) {
                    return null;
                }

                console.log(`[LCU] Package ${packageFolder} has a valid manifest.`);

                // Check if a converted package already exists for this livery

                const convertedPackagePath = Directories.inCommunity(folder + '_a32nx');
                const convertedPackageExists = existsSync(convertedPackagePath);

                if (convertedPackageExists) {
                    return null;
                }

                const packageSimObjectsPath = path.join(packageFolder, 'SimObjects', 'AirPlanes');
                const packageHasSimObjects = existsSync(packageSimObjectsPath);

                if (!packageHasSimObjects) {
                    return null;
                }

                const packageSimObjects = readdirSync(packageSimObjectsPath);
                const packageContainsSimObject = packageSimObjects.length == 1;

                if (!packageContainsSimObject) {
                    return null;
                }

                console.log(`[LCU] Package ${packageFolder} has a valid SimObject.`);

                const simObjectAircraftCfgPath = path.join(packageSimObjectsPath, packageSimObjects[0], `aircraft.cfg`);
                const simObjectContainsAircraftCfg = existsSync(simObjectAircraftCfgPath);

                if (!simObjectContainsAircraftCfg) {
                    return null;
                }

                console.log(`[LCU] SimObject ${packageSimObjects[0]} has an aircraft.cfg.`);

                const aircraftCfgContents = readFileSync(simObjectAircraftCfgPath).toString();

                const simObjectIsOldLivery = aircraftCfgContents.match(/base_container ?= ?"\.\.\\Asobo_A320_NEO"/)?.length > 0;

                if (!simObjectIsOldLivery) {
                    return null;
                }

                console.log(`[LCU] SimObject ${packageSimObjects[0]} is an Asobo A320neo livery.`);

                return {
                    packageName: folder,
                    simObjectName: packageSimObjects[0],
                    title: this.getLiveryTitle(packageFolder, packageSimObjects[0]),
                };
            }).filter((element) => !!element));
    }

    private static getLiveryTitle(packageFolder: string, simObjectName: string): string {
        const parser = new ConfigIniParser();

        const aircraftCfgPath = path.join(packageFolder, 'SimObjects', 'AirPlanes', simObjectName, 'aircraft.cfg');
        const aircraftCfgContents = readFileSync(aircraftCfgPath).toString();

        const aircraftCfg = parser.parse(aircraftCfgContents);

        for (const section of aircraftCfg.sections()) {
            if (!section.startsWith('FLTSIM')) {
                continue;
            }

            if (!aircraftCfg.isHaveOption(section, 'title')) {
                continue;
            }

            return aircraftCfg.get(section, 'title').replace(/ ?;.*/, '').replaceAll('"', '');
        }

        return '<title unknown>';
    }

    static async convertLivery(livery: LiveryDefinition): Promise<boolean> {
        const packageFolder = Directories.inCommunity(livery.packageName);
        const newPackageFolder = packageFolder + '_a32nx';

        await copy(packageFolder, newPackageFolder);

        console.log(`[LCU/Conversion] Created package '${livery.packageName}_a32nx'...`);

        let newSimObjectName;
        if (livery.simObjectName.startsWith('Asobo')) {
            newSimObjectName = livery.simObjectName.replace('Asobo', 'FlyByWire');
        } else {
            newSimObjectName = livery.simObjectName + '+_A32NX_LCU';
        }

        await this.convertPackageManifest(newPackageFolder);

        console.log(`[LCU/Conversion] Converted manifest in '${livery.simObjectName}'...`);

        await rename(
            path.join(newPackageFolder, 'SimObjects', 'AirPlanes', livery.simObjectName),
            path.join(newPackageFolder, 'SimObjects', 'AirPlanes', newSimObjectName)
        );

        console.log(`[LCU/Conversion] Renamed SimObject to '${newSimObjectName}'...`);

        await this.convertPackageLayout(newPackageFolder, livery.simObjectName, newSimObjectName);

        console.log(`[LCU/Conversion] Converted layout in '${newSimObjectName}'...`);

        const { textureFolderName, modelFolderName } = await this.convertAircraftCfg(newPackageFolder, newSimObjectName).catch((error: string) =>
            Promise.reject(`aircraft.cfg invalid (${error})`)
        );

        console.log(`[LCU/Conversion] Converted aircraft.cfg in '${newSimObjectName}'...`);

        await this.convertTextureCfg(newPackageFolder, newSimObjectName, textureFolderName).catch((error: string) =>
            Promise.reject(`TEXTURE.${textureFolderName}/texture.cfg invalid (${error})`)
        );

        console.log(`[LCU/Conversion] Converted texture.cfg in '${newSimObjectName}'...`);

        await this.convertModelCfg(newPackageFolder, newSimObjectName, modelFolderName).catch((error: string) =>
            Promise.reject(`MODEL.${modelFolderName}/model.cfg invalid (${error})`)
        );

        console.log(`[LCU/Conversion] Converted model.cfg in '${newSimObjectName}'...`);

        console.log(`[LCU/Conversion] Done converting '${newSimObjectName}'.`);

        return true;
    }

    private static async convertPackageManifest(packageFolder: string): Promise<void> {
        const manifestPath = path.join(packageFolder, 'manifest.json');
        const manifestContents = (await readFile(manifestPath)).toString();

        const manifest = JSON.parse(manifestContents);
        manifest['title'] = `${manifest['title']} (A32NX Converted)`;

        await writeFile(manifestPath, JSON.stringify(manifest));
    }

    private static async convertPackageLayout(packageFolder: string, oldSimObjectName: string, newSimObjectName: string): Promise<void> {
        const layoutPath = path.join(packageFolder, 'layout.json');
        const layoutContents = (await readFile(layoutPath)).toString();

        await writeFile(layoutPath, layoutContents.replaceAll(oldSimObjectName, newSimObjectName));
    }

    private static async convertAircraftCfg(packageFolder: string, simObjectName: string): Promise<{ textureFolderName: string, modelFolderName: string }> {
        const parser = new ConfigIniParser();

        const aircraftCfgPath = path.join(packageFolder, 'SimObjects', 'AirPlanes', simObjectName, 'aircraft.cfg');
        const aircraftCfgContents = (await readFile(aircraftCfgPath)).toString();

        const aircraftCfg = parser.parse(aircraftCfgContents);

        // Change base container

        aircraftCfg.removeOption(
            'VARIATION',
            'base_container'
        );

        aircraftCfg.set(
            'VARIATION',
            'base_container ',
            '"..\\FlyByWire_A320_NEO"'
        );

        let textureFolderName: string;
        let modelFolderName: string;

        // Edit titles

        for (const section of aircraftCfg.sections()) {
            if (!section.startsWith('FLTSIM')) {
                continue;
            }

            if (!aircraftCfg.isHaveOption(section, 'title')) {
                continue;
            }

            const originalTitle = aircraftCfg.get(section, 'title').replace(/ ?;.*/, '').replaceAll('"', '');
            const newTitle = `${originalTitle} (A32NX Converted)`;

            aircraftCfg.set(section, 'title', `"${newTitle}"`);
        }

        // Edit ui_manufacturer
        for (const section of aircraftCfg.sections()) {
            if (!section.startsWith('FLTSIM')) {
                continue;
            }

            if (!aircraftCfg.isHaveOption(section, 'ui_manufacturer')) {
                continue;
            }
            const newUIManufacturer = `TT:AIRCRAFT.UI_MANUFACTURER`;

            aircraftCfg.set(section, 'ui_manufacturer', `"${newUIManufacturer}" ; e.g. Boeing, Cessna`);
        }

        // Edit ui_type
        for (const section of aircraftCfg.sections()) {
            if (!section.startsWith('FLTSIM')) {
                continue;
            }

            if (!aircraftCfg.isHaveOption(section, 'ui_type')) {
                continue;
            }
            const newUIType = `TT:AIRCRAFT.UI_MODEL`;

            aircraftCfg.set(section, 'ui_type', `"${newUIType}" ; e.g. 747-400, 172`);
        }

        // Find texture folder name

        if (aircraftCfg.sections().includes('FLTSIM.0')) {
            if (aircraftCfg.isHaveOption('FLTSIM.0', 'texture')) {
                textureFolderName = (aircraftCfg.get(
                    'FLTSIM.0',
                    'texture',
                ) as string).replace(/ ?;.*/, '').replaceAll('"', '');
            } else {
                return Promise.reject('No \'texture\' option found in [FLTSIM.0] section');
            }
        } else {
            return Promise.reject('No [FLTSIM.0] section found. Only [FLTSIM.0] is currently supported');
        }

        // Find model folder name

        if (aircraftCfg.sections().includes('FLTSIM.0')) {
            if (aircraftCfg.isHaveOption('FLTSIM.0', 'model')) {
                modelFolderName = (aircraftCfg.get(
                    'FLTSIM.0',
                    'model',
                ) as string).replace(/ ?;.*/, '').replaceAll('"', '');
            } else {
                return Promise.reject('No \'model\' option found in [FLTSIM.0] section');
            }
        } else {
            return Promise.reject('No [FLTSIM.0] section found. Only [FLTSIM.0] is currently supported');
        }

        await writeFile(aircraftCfgPath, aircraftCfg.stringify());

        return { textureFolderName, modelFolderName };
    }

    private static async convertTextureCfg(packageFolder: string, simObjectName: string, textureFolderName: string): Promise<void> {
        const parser = new ConfigIniParser();

        const textureCfgPath = path.join(packageFolder, 'SimObjects', 'AirPlanes', simObjectName, `TEXTURE.${textureFolderName}`, 'texture.cfg');
        const textureCfgContents = (await readFile(textureCfgPath)).toString();

        const textureCfg = parser.parse(textureCfgContents);

        if (!textureCfg.sections().includes('fltsim')) {
            return Promise.reject('No [fltsim] section found');
        }

        for (const option of textureCfg.options('fltsim')) {
            if (!option.startsWith('fallback.')) {
                continue;
            }

            const value = textureCfg.get('fltsim', option) as string;
            if (value.includes('Asobo_A320_NEO')) {
                textureCfg.set('fltsim', option, value.replace('Asobo_A320_NEO', 'FlyByWire_A320_NEO'));
            }
        }

        await writeFile(textureCfgPath, textureCfg.stringify());
    }

    private static async convertModelCfg(packageFolder: string, simObjectName: string, modelFolderName: string): Promise<void> {
        const parser = new ConfigIniParser();

        const modelCfgPath = path.join(packageFolder, 'SimObjects', 'AirPlanes', simObjectName, `MODEL.${modelFolderName}`, 'model.cfg');
        if (!existsSync(modelCfgPath)) {
            console.log(`[LCU/Conversion] '${simObjectName}' does not have a 'model' folder`);
            return;
        }
        const modelCfgContents = (await readFile(modelCfgPath)).toString();

        const modelCfg = parser.parse(modelCfgContents);

        if (!modelCfg.sections().includes('models')) {
            return Promise.reject('No [models] section found');
        }

        for (const option of modelCfg.options('models')) {
            if (option === 'exterior') {
                const originalValue = modelCfg.get('models', 'exterior');

                modelCfg.set(
                    'models',
                    'exterior',
                    originalValue.replaceAll('Asobo_A320_NEO', 'FlyByWire_A320_NEO')
                );
            }
            if (option === 'normal') {
                const originalValue = modelCfg.get('models', 'normal');

                modelCfg.set(
                    'models',
                    'normal',
                    originalValue.replaceAll('Asobo_A320_NEO/model/', 'FlyByWire_A320_NEO/model/')
                );
            }
            if (option === 'interior') {
                const originalValue = modelCfg.get('models', 'interior');

                modelCfg.set(
                    'models',
                    'interior',
                    originalValue.replaceAll('Asobo_A320_NEO', 'FlyByWire_A320_NEO')
                );
            }
        }

        await writeFile(modelCfgPath, modelCfg.stringify());
    }

}
