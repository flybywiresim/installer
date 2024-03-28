import {
  Addon,
  Configuration,
  Definition,
  ExternalApplicationDefinition,
  Publisher,
} from 'renderer/utils/InstallerConfiguration';
import { store } from 'renderer/redux/store';

const _cache: { [k: string]: Definition } = {};

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

  public static findDefinition(ref: string, publisher: Publisher): Definition {
    if (_cache[ref]) {
      return _cache[ref];
    }

    const isOwnPublisher = ref[1] === '/';

    if (isOwnPublisher) {
      const defKey = ref.substring(2);

      const found = publisher.defs.find((it) => it.key === defKey);

      _cache[ref] = found;

      return found;
    } else {
      const parsedRef = /@(\w+)\/(\w+)/;

      if (!parsedRef) {
        throw new Error(`Could not parse reference=${ref}`);
      }

      const [, publisherKey, defKey] = parsedRef[Symbol.match](ref);

      const publisher = this.findPublisher(publisherKey);

      if (!publisher) {
        throw new Error(`Cannot find publisher with key=${publisherKey}`);
      }

      const found = publisher.defs.find((it) => it.key === defKey);

      if (!found) {
        throw new Error(`Cannot find definition with key=${defKey} for publisher=${publisher.key}`);
      }

      _cache[ref] = found;

      return found;
    }
  }

  public static getExternalApps(publisherKey: string): ExternalApplicationDefinition[] {
    const publisher = this.findPublisher(publisherKey);

    if (!publisher) {
      throw new Error(`Cannot find publisher with key=${publisherKey}`);
    }

    return publisher.defs.filter((it) => it.kind === 'externalApp') as ExternalApplicationDefinition[];
  }
}
