import { Addon, ExternalApplicationDefinition, Publisher } from "renderer/utils/InstallerConfiguration";
import { useAppSelector } from "renderer/redux/store";
import { ApplicationStatus } from "renderer/components/AddonSection/Enums";
import { ExternalApps } from "renderer/utils/ExternalApps";

export type AddonExternalAppsInfo = [running: ExternalApplicationDefinition[], all: ExternalApplicationDefinition[]];

export const useAddonExternalApps = (addon: Addon, publisher: Publisher): AddonExternalAppsInfo => {
    const applicationStatus = useAppSelector((state) => state.applicationStatus);

    const disallowedRunningExternalApps = ExternalApps.forAddon(addon, publisher);

    return [
        disallowedRunningExternalApps.filter((it) => applicationStatus[it.key] === ApplicationStatus.Open),
        disallowedRunningExternalApps,
    ];
};
