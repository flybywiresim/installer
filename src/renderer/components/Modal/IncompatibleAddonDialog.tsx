import React, { FC } from 'react';
import { Addon, AddonIncompatibleAddon } from 'renderer/utils/InstallerConfiguration';

export interface IncompatibleAddonDialogBodyProps {
  addon: Addon;
  incompatibleAddons: AddonIncompatibleAddon[];
}

export const IncompatibleAddonDialogBody: FC<IncompatibleAddonDialogBodyProps> = ({ addon, incompatibleAddons }) => (
  <>
    <p>The following addons are incompatible with "{addon.name}":</p>
    <p className="h-80 overflow-y-scroll">
      <ul className="pl-2">
        {incompatibleAddons.map((a) => (
          <div className="flex items-center gap-x-7 bg-navy px-7 py-6 rounded-md my-6">
            <div className="flex flex-col gap-y-2">
              <span className="text-2xl font-bold">{a.title}</span> <span>{a.folder}</span>{' '}
              <span className="text-l">{a.description}</span>
            </div>
          </div>
        ))}
      </ul>
    </p>
    <p>
      <span className="text-4xl">Continue installing "{addon.name}"?</span>
    </p>
  </>
);
