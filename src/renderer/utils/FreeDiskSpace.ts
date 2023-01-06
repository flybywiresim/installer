import { Directories } from "renderer/utils/Directories";
import fs from 'fs-extra';
import checkDiskSpace from "check-disk-space";

export enum FreeDiskSpaceStatus {
    NotLimited,
    LimitedByDestination,
    LimitedByTemporary,
    LimitedByBoth,
}

export interface FreeDiskSpaceInfo {
    freeSpaceInDest: number,
    freeSpaceInTemp: number,
    status: FreeDiskSpaceStatus,
}

export class FreeDiskSpace {

    static async analyse(requiredSpace: number): Promise<FreeDiskSpaceInfo> {
        let resolvedDestDir = Directories.installLocation();
        let resolvedTempDir = Directories.tempLocation();

        try {
            resolvedDestDir = await fs.readlink(resolvedDestDir);
        } catch (e) {
            // noop - it's probably not a link
        }

        try {
            resolvedTempDir = await fs.readlink(resolvedTempDir);
        } catch (e) {
            // noop - it's probably not a link
        }

        const freeDestDirSpace = (await checkDiskSpace(resolvedDestDir)).free;
        const freeTempDirSpace = (await checkDiskSpace(resolvedTempDir)).free;

        let status: FreeDiskSpaceStatus;
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
