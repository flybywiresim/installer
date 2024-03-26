import React, { FC } from 'react';
import { Box } from 'react-bootstrap-icons';
import { Addon, AddonDependency, Publisher } from 'renderer/utils/InstallerConfiguration';

export interface DependencyDialogBodyProps {
  addon: Addon;
  dependency: AddonDependency;
  dependencyAddon: Addon;
  dependencyPublisher: Publisher;
}

export const DependencyDialogBody: FC<DependencyDialogBodyProps> = ({
  addon,
  dependency,
  dependencyAddon,
  dependencyPublisher,
}) => (
  <>
    <p>
      <b>{dependencyAddon.name}</b> by <b>{dependencyPublisher.name}</b> needs to be installed to use the full
      functionality of <b>{addon.name}</b>.
    </p>

    <div className="my-6 flex items-center gap-x-7 rounded-md bg-navy px-7 py-6">
      <Box size={36} />

      <div className="flex flex-col gap-y-2">
        <span className="text-3xl font-medium">{dependencyPublisher.name}</span>
        <span className="text-4xl font-semibold">{dependencyAddon.name}</span>
      </div>
    </div>

    <p>{dependency.modalText}</p>
  </>
);
