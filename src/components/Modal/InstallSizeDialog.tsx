import React, { FC } from "react";
import { UpdateInfo } from "@flybywiresim/fragmenter";
import { PromptModal } from "./index";
import { Download, Hdd, HddFill } from "react-bootstrap-icons";
import { ButtonType } from "../Button";

const GIB = 1_074_000_000;
const MIB = 1_049_000;

function formatSize(size: number): string {
    const numGigabytes = size / GIB;

    if (numGigabytes > 1) {
        return `${numGigabytes.toFixed(1)} GiB`;
    } else {
        const numMegabytes = size / MIB;

        return `${numMegabytes.toFixed(1)} MiB`;
    }
}

export interface InstallSizeDialogProps {
    updateInfo: UpdateInfo,
    onConfirm?: () => void,
    onCancel?: () => void,
    availableDiskSpace: number,
    dontShowAgainSettingName: string,
}

export const InstallSizeDialog: FC<InstallSizeDialogProps> = ({ updateInfo, onConfirm, onCancel, availableDiskSpace, dontShowAgainSettingName }) => {
    const requiredDiskSpace = (updateInfo.requiredDiskSpace + updateInfo.downloadSize) + (10 * MIB);

    const availableDiskSpaceSufficient = availableDiskSpace > requiredDiskSpace;

    const availableDiskSpaceColor = availableDiskSpaceSufficient ? 'text-utility-green' : 'text-utility-red';

    return (
        <PromptModal
            title={"Package size"}
            bodyText={(
                <div className="flex flex-col gap-y-8 mt-5">
                    <div className="flex flex-col rounded-sm">
                        <span className="flex justify-between items-center">
                            <span className="flex gap-x-6 items-center">
                                <Download size={30} />

                                <span className="text-3xl">Download size</span>
                            </span>

                            <span className="text-5xl font-bold font-manrope">{formatSize(updateInfo.downloadSize)}</span>
                        </span>
                    </div>

                    <hr className="m-0" />

                    <div className="flex flex-col rounded-sm">
                        <span className="flex gap-x-5 justify-between items-center">
                            <span className="flex gap-x-6 items-center">
                                <HddFill size={30} />

                                <span className="text-3xl">Required disk space</span>
                            </span>

                            <span className="text-4xl font-bold font-manrope">{formatSize(requiredDiskSpace)}</span>
                        </span>
                    </div>

                    <div className="flex flex-col rounded-sm">
                        <span className="flex gap-x-5 justify-between items-center">
                            <span className="flex gap-x-6 items-center">
                                <Hdd size={30} />

                                <span className="text-3xl">Available disk space</span>
                            </span>

                            <span className={`text-4xl font-bold font-manrope ${availableDiskSpaceColor}`}>{formatSize(availableDiskSpace)}</span>
                        </span>
                    </div>

                    {(!availableDiskSpaceSufficient) && (
                        <div className="w-full flex items-center gap-x-7 border-2 px-7 py-3.5 border-utility-red text-utility-red rounded-md">
                            <Hdd className="text-utility-red" size={36} />

                            <div className="flex flex-col gap-y-2.5">
                                <span className="text-4xl font-bold font-manrope">Not enough available disk space</span>

                                <span className="text-2xl">Try to free up space in order to install this addon.</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            confirmText="Install"
            confirmColor={ButtonType.Positive}
            onConfirm={onConfirm}
            confirmEnabled={availableDiskSpaceSufficient}
            onCancel={onCancel}
            dontShowAgainSettingName={availableDiskSpaceSufficient ? dontShowAgainSettingName : undefined}
        />
    );
};
