export interface PluginMetadata {
    id: string,
    author: string,
    name: string,
    description: string,
    version: string,
    iconFile: string,
}

export enum PluginAssetType {
    ConfigurationExtension = 'configuration_extension',
}

export interface PluginAsset {
    type: PluginAssetType,
    file: string,
}

export interface PluginDistributionFile {
    originUrl: string,
    metadata: PluginMetadata,
    assets: PluginAsset[],
    signature?: string,
}
