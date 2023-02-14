import { PluginAsset, PluginAssetType, PluginDistributionFile } from "common/plugins/PluginDistributionFile";
import { ConfigurationExtension } from "renderer/utils/InstallerConfiguration";

export interface PluginUserPreviewInfo {
    downloadServers: string[],
}

export class PluginUtils {
    static async generateUserPreview(dist: PluginDistributionFile): Promise<PluginUserPreviewInfo> {
        const downloadServers = new Set<string>();

        for (const asset of dist.assets) {
            switch (asset.type) {
                case PluginAssetType.ConfigurationExtension: {
                    const configExtensionBuffer = await this.downloadPluginAsset(dist, asset);
                    const configExtension: ConfigurationExtension = JSON.parse(await configExtensionBuffer.text());

                    for (const directive of configExtension.directives) {
                        switch (directive.directive) {
                            case "addPublishers": {
                                for (const publisher of directive.publishers) {
                                    for (const addon of publisher.addons) {
                                        for (const track of addon.tracks) {
                                            downloadServers.add(track.url);
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }

                    break;
                }
            }
        }

        return {
            downloadServers: Array.from(downloadServers),
        };
    }

    static async downloadPluginDistFile(baseUrl: string): Promise<Blob> {
        const url = `${baseUrl}/dist.json`;

        const response = await fetch(url);

        return response.blob();
    }

    static async downloadPluginAsset(dist: PluginDistributionFile, asset: PluginAsset): Promise<Blob> {
        const url = `${dist.originUrl}/assets/${asset.file}`;

        const response = await fetch(url);

        return response.blob();
    }
}
