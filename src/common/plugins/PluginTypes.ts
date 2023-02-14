import { PluginAsset, PluginDistributionFile } from "common/plugins/PluginDistributionFile";

export interface PluginAssetPayload extends PluginAsset {
    buffer: Buffer,
}

export interface PluginPayload {
    distFile: PluginDistributionFile,
    assets: PluginAssetPayload[],
}
