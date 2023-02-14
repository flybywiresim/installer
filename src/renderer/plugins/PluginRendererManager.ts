import { PluginAssetType } from "common/plugins/PluginDistributionFile";
import { PluginAssetPayload, PluginPayload } from "common/plugins/PluginTypes";
import { ConfigurationExtension } from "renderer/utils/InstallerConfiguration";
import { store } from "renderer/redux/store";
import { addPublisher } from "renderer/redux/features/configuration";

export class PluginRendererManager {
    public static loadPlugin(pluginPayload: PluginPayload): void {
        // TODO verify dist

        console.log(`[PluginSystem] Loading plugin ${pluginPayload.distFile.metadata.id}@${pluginPayload.distFile.metadata.version} with ${pluginPayload.assets.length} asset(s)`);

        for (const asset of pluginPayload.assets) {
            console.log(`[PluginSystem] Processing asset '${asset.file}' (${asset.type})`);

            switch (asset.type) {
                case PluginAssetType.ConfigurationExtension: {
                    this.processConfigurationExtensionAsset(asset);
                    break;
                }
                default: console.error(`[PluginSystem] Unsupported asset type '${asset.type}' for asset '${asset.file}'`);
            }
        }

        console.log(`[PluginSystem] Done loading plugin ${pluginPayload.distFile.metadata.id}@${pluginPayload.distFile.metadata.version}.`);
    }

    private static processConfigurationExtensionAsset(assetPayload: PluginAssetPayload) {
        const configurationExtension = JSON.parse(new TextDecoder().decode(assetPayload.buffer)) as ConfigurationExtension;

        // TODO verify config extension

        console.log(`[PluginSystem](processConfigurationExtensionAsset) Processing ${configurationExtension.directives.length} directive(s)`);

        const configurationState = store.getState().configuration;

        for (let i = 0; i < configurationExtension.directives.length; i++) {
            const directive = configurationExtension.directives[i];

            switch (directive.directive) {
                case "addPublishers": {
                    for (const publisher of directive.publishers) {
                        const existingPublisher = configurationState.publishers.find((it) => it.key === publisher.key);

                        if (existingPublisher) {
                            console.warn(`[PluginSystem](processConfigurationExtensionAsset) Publisher '${publisher.key}' of directive #${i} dropped because it was already declared`);
                            continue;
                        }

                        console.log(`[PluginSystem](processConfigurationExtensionAsset) Directive #${i} addPublisher ${publisher.key}`);

                        store.dispatch(addPublisher({ publisher }));
                    }

                    break;
                }
                default: console.error(`[PluginSystem](processConfigurationExtensionAsset) Unknown directive type '${directive.directive}' for directive #${i}`);
            }
        }
    }
}
