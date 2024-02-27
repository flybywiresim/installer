import React, { FC } from "react";
import {
    Addon,
    DirectoryDefinition,
    ExternalLink,
    NamedDirectoryDefinition,
} from "renderer/utils/InstallerConfiguration";
import { BoxArrowRight, Folder } from "react-bootstrap-icons";
import { ipcRenderer, shell } from "electron";
import { Directories } from "renderer/utils/Directories";
import { useAppSelector } from "renderer/redux/store";
import { InstallStatusCategories } from "renderer/components/AddonSection/Enums";
import channels from "common/channels";

export interface MyInstallProps {
    addon: Addon,
}

export const MyInstall: FC<MyInstallProps> = ({ addon }) => {
    const installStates = useAppSelector((state) => state.installStatus);

    const links: ExternalLink[] = [
        ...(addon.myInstallPage?.links ?? []),
    ];

    const directories: NamedDirectoryDefinition[] = [
        {
            location: {
                in: 'community',
                path: addon.targetDirectory,
            },
            title: 'Package Files',
        },
        ...(addon.myInstallPage?.directories ?? []),
    ];

    const handleClickLink = (link: ExternalLink) => {
        const parsed = new URL(link.url);

        if (parsed.protocol.match(/https?/)) {
            shell.openExternal(link.url).then();
        }
    };

    const handleClickDirectory = (def: DirectoryDefinition) => {
        let fullPath;
        switch (def.location.in) {
            case 'community':
                fullPath = Directories.inInstallLocation(def.location.path);
                break;
            case 'package':
                fullPath = Directories.inInstallPackage(addon, def.location.path);
                break;
            case "packageCache":
                fullPath = Directories.inPackageCache(addon, def.location.path);
                break;
        }

        ipcRenderer.send(channels.openPath, fullPath);
    };

    const directoriesDisabled = !InstallStatusCategories.installed.includes(installStates[addon.key]?.status);

    return (
        <div className="flex flex-row w-full h-full mt-5 gap-x-8 text-quasi-white">
            {links.length > 0 && (
                <div>
                    <h3 className="text-white font-bold">Links</h3>

                    <div className="flex items-center gap-x-3">
                        {links.map((it) => (
                            <button
                                key={it.title}
                                className="flex items-center gap-x-5 bg-navy-light hover:bg-transparent border-2 border-navy-light hover:border-cyan px-7 py-4 text-3xl rounded-md transition-colors duration-100"
                                onClick={() => handleClickLink(it)}
                            >
                                <BoxArrowRight size={24}/>

                                {it.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {directories.length > 0 && (
                <div>
                    <h3 className="text-white font-bold">Directories</h3>

                    <div className="flex items-center gap-x-3">
                        {directories.map((it) => (
                            <button
                                key={it.title}
                                className={`flex items-center gap-x-5 bg-navy-light hover:bg-transparent border-2 border-navy-light hover:border-cyan px-7 py-4 text-3xl rounded-md transition-colors duration-100 ${directoriesDisabled ? 'opacity-60 pointer-events-none' : ''}`}
                                onClick={() => handleClickDirectory(it)}
                            >
                                <Folder size={24} />

                                {it.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
