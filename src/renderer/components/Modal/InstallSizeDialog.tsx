import React, { FC } from 'react';
import { UpdateInfo } from '@flybywiresim/fragmenter';
import { PromptModal } from 'renderer/components/Modal/index';
import { Download, Hdd, HddFill } from 'react-bootstrap-icons';
import { ButtonType } from 'renderer/components/Button';
import { FreeDiskSpaceInfo } from 'renderer/utils/FreeDiskSpace';

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
  updateInfo: UpdateInfo;
  freeDeskSpaceInfo: FreeDiskSpaceInfo;
  onConfirm?: () => void;
  onCancel?: () => void;
  dontShowAgainSettingName: string;
}

export const InstallSizeDialog: FC<InstallSizeDialogProps> = ({
  updateInfo,
  freeDeskSpaceInfo,
  onConfirm,
  onCancel,
  dontShowAgainSettingName,
}) => {
  const requiredDiskSpace = updateInfo.requiredDiskSpace + updateInfo.downloadSize + 10 * MIB;

  const showTemporaryAsSeparate = freeDeskSpaceInfo.freeSpaceInDest !== freeDeskSpaceInfo.freeSpaceInTemp;

  const sufficientSpaceInDest = freeDeskSpaceInfo.freeSpaceInDest > requiredDiskSpace;
  const sufficientSpaceInTemp = freeDeskSpaceInfo.freeSpaceInTemp > requiredDiskSpace;

  const canInstall = sufficientSpaceInDest && sufficientSpaceInTemp;

  const availableDiskSpaceColorDest = sufficientSpaceInDest ? 'text-utility-green' : 'text-utility-red';
  const availableDiskSpaceColorTemp = sufficientSpaceInTemp ? 'text-utility-green' : 'text-utility-red';

  return (
    <PromptModal
      title={'Package size'}
      bodyText={
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

                <span className="text-3xl">Available disk space (destination)</span>
              </span>

              <span className={`text-4xl font-bold font-manrope ${availableDiskSpaceColorDest}`}>
                {formatSize(freeDeskSpaceInfo.freeSpaceInDest)}
              </span>
            </span>

            {showTemporaryAsSeparate && (
              <span className="flex gap-x-5 justify-between items-center">
                <span className="flex gap-x-6 items-center">
                  <Hdd size={30} />

                  <span className="text-3xl">Available disk space (temporary)</span>
                </span>

                <span className={`text-4xl font-bold font-manrope ${availableDiskSpaceColorTemp}`}>
                  {formatSize(freeDeskSpaceInfo.freeSpaceInTemp)}
                </span>
              </span>
            )}
          </div>

          {!canInstall && (
            <div className="w-full flex items-center gap-x-7 border-2 px-7 py-3.5 border-utility-red text-utility-red rounded-md">
              <Hdd className="text-utility-red" size={36} />

              <div className="flex flex-col gap-y-2.5">
                <span className="text-4xl font-bold font-manrope">Not enough available disk space</span>

                <span className="text-2xl">Try to free up space in order to install this addon.</span>
              </div>
            </div>
          )}
        </div>
      }
      confirmText="Install"
      confirmColor={ButtonType.Positive}
      onConfirm={onConfirm}
      confirmEnabled={canInstall}
      onCancel={onCancel}
      dontShowAgainSettingName={sufficientSpaceInDest ? dontShowAgainSettingName : undefined}
    />
  );
};
