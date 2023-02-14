import { app, ipcMain } from "electron";
import fs from "fs-extra";
import path from "path";
import { PluginAsset, PluginDistributionFile } from "common/plugins/PluginDistributionFile";
import channels from "common/channels";
import fetch, { Response } from 'node-fetch';
import { PluginAssetPayload, PluginPayload } from "common/plugins/PluginTypes";
import { parse, compare } from "semver";

export class PluginInstallManager {
    static setupIpcListeners(): void {
        ipcMain.on(channels.plugins.installFromUrl, (event, url: string) => this.installPlugin(url));
        ipcMain.handle(channels.plugins.getPluginsToLoad, async () => await this.getPluginsToLoad());
        ipcMain.handle(channels.plugins.checkForUpdates, async () => await this.checkForPluginUpdates());
    }

    private static async installPlugin(baseUrl: string): Promise<void> {
        let distFileResponse: Response;

        try {
            distFileResponse = await this.downloadPluginDistFile(baseUrl);
        } catch (e) {
            throw new Error(`[PluginInstallManager] Could not download plugin dist file: ${e.message}`);
        }

        const dist = JSON.parse(await distFileResponse.text()) as PluginDistributionFile;

        // TODO validate dist file
        // TODO validate signature

        const pluginPath = path.join(this.getPluginsRoot(), dist.metadata.id);
        const pluginVersionPath = path.join(pluginPath, dist.metadata.version.toString());

        await fs.mkdir(pluginPath);
        await fs.mkdir(pluginVersionPath);
        await fs.mkdir(path.join(pluginVersionPath, 'assets'));

        for (const asset of dist.assets) {
            const assetBlob = await this.downloadPluginAsset(dist, asset);

            await fs.writeFile(path.join(pluginVersionPath, 'assets', asset.file), await assetBlob.buffer());
        }

        await fs.writeFile(path.join(pluginPath, 'dist.json'), JSON.stringify(dist));

        // Create link from current to installed version
        await fs.symlink(pluginVersionPath, path.join(pluginPath, 'current'), 'junction');

        console.log(`[PluginInstallManager] Done installing ${dist.metadata.id}@${dist.metadata.version}`);
    }

    private static async getPluginsToLoad(): Promise<PluginPayload[]> {
        const dirents = await fs.readdir(this.getPluginsRoot(), { withFileTypes: true });

        const pluginPayload: PluginPayload[] = [];
        for (const ent of dirents) {
            if (!ent.isDirectory()) {
                continue;
            }

            const pluginDir = path.join(this.getPluginsRoot(), ent.name);

            const distBuffer = await fs.readFile(path.join(pluginDir, 'dist.json'));
            const distFile = JSON.parse(distBuffer.toString('utf-8')) as PluginDistributionFile;

            // TODO verify dist file

            const assetPayloads: PluginAssetPayload[] = [];
            for (const asset of distFile.assets) {
                // TODO verify asset

                const buffer = await fs.readFile(path.join(pluginDir, 'current', 'assets', asset.file));

                assetPayloads.push({ ...asset, buffer });
            }

            pluginPayload.push({ distFile, assets: assetPayloads });
        }

        return pluginPayload;
    }

    private static async getMinimalPluginsToLoad(): Promise<Omit<PluginPayload, 'assets'>[]> {
        const dirents = await fs.readdir(this.getPluginsRoot(), { withFileTypes: true });

        const pluginPayload: Omit<PluginPayload, 'assets'>[] = [];
        for (const ent of dirents) {
            if (!ent.isDirectory()) {
                continue;
            }

            const pluginDir = path.join(this.getPluginsRoot(), ent.name);

            const distBuffer = await fs.readFile(path.join(pluginDir, 'dist.json'));
            const distFile = JSON.parse(distBuffer.toString('utf-8')) as PluginDistributionFile;

            // TODO verify dist file

            pluginPayload.push({ distFile });
        }

        return pluginPayload;
    }

    private static async checkForPluginUpdates(): Promise<PluginDistributionFile[]> {
        const installedPlugins = await this.getMinimalPluginsToLoad();

        const pluginsToUpdate: PluginDistributionFile[] = [];

        for (const plugin of installedPlugins) {
            let distFileResponse: Response;

            try {
                distFileResponse = await this.downloadPluginDistFile(plugin.distFile.originUrl);
            } catch (e) {
                throw new Error(`[PluginInstallManager] Could not download plugin dist file: ${e.message}`);
            }

            const dist = JSON.parse(await distFileResponse.text()) as PluginDistributionFile;

            const versionDiff = compare(parse(dist.metadata.version), parse(plugin.distFile.metadata.version));

            if (versionDiff === 1) {
                pluginsToUpdate.push(dist);
            }
        }

        return pluginsToUpdate;
    }

    private static getPluginsRoot() {
        return path.join(app.getPath('userData'), 'plugins');
    }

    private static async downloadPluginDistFile(baseUrl: string): Promise<Response> {
        const url = `${baseUrl}/dist.json`;

        return await fetch(url);
    }

    private static async downloadPluginAsset(dist: PluginDistributionFile, asset: PluginAsset): Promise<Response> {
        const url = `${dist.originUrl}/assets/${asset.file}`;

        return await fetch(url);
    }
}
