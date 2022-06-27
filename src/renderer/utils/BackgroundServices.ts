import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { Resolver } from "renderer/utils/Resolver";
import { store } from "renderer/redux/store";
import { ApplicationStatus } from "renderer/components/AddonSection/Enums";

export class BackgroundServices {
    static checkIsRunning(addon: Addon, publisher: Publisher): boolean {
        if (!addon.backgroundService) {
            throw new Error('Attempted to check if background service was running on an addon without a background service');
        }

        const appRef = addon.backgroundService.runCheckExternalAppRef;
        const app = Resolver.findDefinition(appRef, publisher);

        if (!app || app.kind !== 'externalApp') {
            throw new Error(`Attempted to check if background service was running, but runCheckExternalAppRef=${appRef} does not refer to a valid external app`);
        }

        const state = store.getState().applicationStatus[app.key];

        return state === ApplicationStatus.Open;
    }
}
