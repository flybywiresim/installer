import React, { FC } from "react";
import { Addon, AddonIncompatibleAddon } from "renderer/utils/InstallerConfiguration";

export interface IncompatibleAddonDialogBodyProps {
    addon: Addon,
    incompatibleAddons: AddonIncompatibleAddon[],
}

export const IncompatibleAddonDialogBody: FC<IncompatibleAddonDialogBodyProps> = ({ addon, incompatibleAddons }) => (
    <>
        The following addons are incompatible with "{addon.name}":
        <p/>
        <ul>
            {incompatibleAddons.map((a) => (
                <li>- {a.title} ({a.folder})</li>
            ))}
        </ul>
        <p/>
        It is recommended to uninstall these addons before installing "{addon.name}".
        <p/>
        <span className="text-4xl">Continue installing "{addon.name}"?</span>
        {/*<p>*/}
        {/*    <b>{dependencyAddon.name}</b>*/}
        {/*    {' '}*/}
        {/*    by*/}
        {/*    {' '}*/}
        {/*    <b>{dependencyPublisher.name}</b>*/}
        {/*    {' '}*/}
        {/*    needs to be installed to use the full functionality of*/}
        {/*    {' '}*/}
        {/*    <b>{addon.name}</b>*/}
        {/*    .*/}
        {/*</p>*/}

        {/*<div className="flex items-center gap-x-7 bg-navy px-7 py-6 rounded-md my-6">*/}
        {/*    <Box size={36} />*/}

        {/*    <div className="flex flex-col gap-y-2">*/}
        {/*        <span className="text-3xl font-medium">{dependencyPublisher.name}</span>*/}
        {/*        <span className="text-4xl font-semibold">{dependencyAddon.name}</span>*/}
        {/*    </div>*/}
        {/*</div>*/}

        {/*<p>{dependency.modalText}</p>*/}
    </>
);
