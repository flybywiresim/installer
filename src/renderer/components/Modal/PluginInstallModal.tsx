import React, { FC, useEffect, useState } from 'react';
import { PromptModal } from "renderer/components/Modal/index";
import { PluginDistributionFile } from "common/plugins/PluginDistributionFile";
import { ButtonType } from "renderer/components/Button";
import { PluginUtils, PluginUserPreviewInfo } from "common/plugins/PluginUtils";
import { ipcRenderer } from "electron";
import channels from "common/channels";

export interface PluginInstallModalProps {
    pluginDistributionFile: PluginDistributionFile,
    onAcknowledge?: () => void;
}

export const PluginInstallModal: FC<PluginInstallModalProps> = ({ pluginDistributionFile }) => {
    const [previewInfo, setPreviewInfo] = useState<PluginUserPreviewInfo | null>(null);

    useEffect(() => {
        PluginUtils.generateUserPreview(pluginDistributionFile).then((info) => setPreviewInfo(info));
    }, []);

    const onConfirm = async () => ipcRenderer.send(channels.plugins.installFromUrl, pluginDistributionFile.originUrl);

    return (
        <PromptModal
            title={(
                <div className="flex flex-col items-center gap-y-3.5 text-utility-red fill-current mb-2.5">
                    <h2 className="modal-title-sm">Do you want to add</h2>
                    <img className="bg-navy-light p-3 rounded-md" width={64} src={pluginDistributionFile.metadata.iconFile} />
                    <h1 className="modal-title pb-0">{pluginDistributionFile.metadata.name}</h1>
                    <h3 className="modal-title-sm">to your installer?</h3>
                </div>
            )}
            bodyText={(
                <div className="flex flex-col gap-y-5">
                    <p>{pluginDistributionFile.metadata.description}</p>

                    {previewInfo?.downloadServers.length > 0 && (
                        <>
                            <p>Includes addons downloaded from the following servers</p>

                            {previewInfo.downloadServers.map((server) => <pre className="overflow-hidden">{server}</pre>)}
                        </>
                    )}
                </div>
            )}
            onConfirm={onConfirm}
            confirmColor={ButtonType.Positive}
        />
    );
};
