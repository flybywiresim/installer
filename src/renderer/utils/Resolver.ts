import { Addon, Configuration, Publisher } from "renderer/utils/InstallerConfiguration";
import { store } from "renderer/redux/store";

export class Resolver {
    private static getConfiguration(): Configuration {
        return store.getState().configuration;
    }

    public static findPublisher(key: string): Publisher | undefined {
        const config = this.getConfiguration();

        return config.publishers.find((it) => it.key === key);
    }

    public static findAddon(publisherKey: string, addonKey: string): Addon | undefined {
        const publisher = this.findPublisher(publisherKey);

        if (!publisher) {
            return undefined;
        }

        return publisher.addons.find((it) => it.key === addonKey);
    }
}
