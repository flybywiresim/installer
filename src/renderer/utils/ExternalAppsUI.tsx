import React from 'react';
import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import { store, useAppSelector } from 'renderer/redux/store';
import { ApplicationStatus } from 'renderer/components/AddonSection/Enums';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { CannotInstallDialog } from 'renderer/components/Modal/CannotInstallDialog';

export type AddonExternalAppsInfo = [running: ExternalApplicationDefinition[], all: ExternalApplicationDefinition[]];

/**
 * Hook to obtain external app info for an addon. Returns both all running apps relevant to this addon, and all ones relevant.
 *
 * @param addon     the addon
 * @param publisher the publisher of the addon
 */
export const useAddonExternalApps = (addon: Addon, publisher: Publisher): AddonExternalAppsInfo => {
  const applicationStatus = useAppSelector((state) => state.applicationStatus);

  const disallowedRunningExternalApps = ExternalApps.forAddon(addon, publisher);

  return [
    disallowedRunningExternalApps.filter((it) => applicationStatus[it.key] === ApplicationStatus.Open),
    disallowedRunningExternalApps,
  ];
};

export class ExternalAppsUI {
  /**
   * Shows a modal presenting the user with running external apps for this addon that must be closed. When all apps are closed,
   * and the user presses "Confirm", the promise is resolved with `true`. In all other cases, it is resolved with `false`.
   *
   * @param addon     the addon
   * @param publisher the publisher of the addon
   * @param showModal a function to show a modal and return a promise based on the button clicked
   */
  static async ensureNoneRunningForAddon(
    addon: Addon,
    publisher: Publisher,
    showModal: (modal: JSX.Element) => Promise<boolean>,
  ): Promise<boolean> {
    const addonExternalApps = ExternalApps.forAddon(addon, publisher);
    const runningExternalApps = addonExternalApps.filter(
      (app) => store.getState().applicationStatus[app.key] == ApplicationStatus.Open,
    );

    if (runningExternalApps.length > 0) {
      return await showModal(<CannotInstallDialog addon={addon} publisher={publisher} />);
    }

    return true;
  }
}
