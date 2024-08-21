import { Directories } from 'renderer/utils/Directories';
import fs from 'fs';
import checkDiskSpace from 'check-disk-space';

export enum FreeDiskSpaceStatus {
  Unknown,
  NotLimited,
  LimitedByDestination,
  LimitedByTemporary,
  LimitedByBoth,
}

export interface FreeDiskSpaceInfo {
  freeSpaceInDest: number;
  freeSpaceInTemp: number;
  status: FreeDiskSpaceStatus;
}

export class FreeDiskSpace {
  static async analyse(requiredSpace: number): Promise<FreeDiskSpaceInfo> {
    if (!Number.isFinite(requiredSpace)) {
      return {
        freeSpaceInTemp: -1,
        freeSpaceInDest: -1,
        status: FreeDiskSpaceStatus.Unknown,
      };
    }

    let resolvedDestDir = Directories.installLocation();
    let resolvedTempDir = Directories.tempLocation();

    try {
      resolvedDestDir = await fs.promises.readlink(resolvedDestDir);
    } catch (e) {
      // noop - it's probably not a link
    }

    try {
      resolvedTempDir = await fs.promises.readlink(resolvedTempDir);
    } catch (e) {
      // noop - it's probably not a link
    }

    let freeDestDirSpace = NaN;
    try {
      freeDestDirSpace = (await checkDiskSpace(resolvedDestDir)).free;
    } catch (e) {
      // noop - user probably does not have `wmic` on their system
    }

    let freeTempDirSpace = NaN;
    try {
      freeTempDirSpace = (await checkDiskSpace(resolvedTempDir)).free;
    } catch (e) {
      // noop - user probably does not have `wmic` on their system
    }

    if (!Number.isFinite(freeDestDirSpace) || !Number.isFinite(freeTempDirSpace)) {
      return {
        freeSpaceInTemp: -1,
        freeSpaceInDest: -1,
        status: FreeDiskSpaceStatus.Unknown,
      };
    }

    let status = FreeDiskSpaceStatus.NotLimited;
    if (requiredSpace >= freeDestDirSpace && requiredSpace >= freeTempDirSpace) {
      status = FreeDiskSpaceStatus.LimitedByBoth;
    } else if (requiredSpace >= freeDestDirSpace) {
      status = FreeDiskSpaceStatus.LimitedByDestination;
    } else if (requiredSpace >= freeTempDirSpace) {
      status = FreeDiskSpaceStatus.LimitedByTemporary;
    }

    return {
      freeSpaceInDest: freeDestDirSpace,
      freeSpaceInTemp: freeTempDirSpace,
      status,
    };
  }
}
