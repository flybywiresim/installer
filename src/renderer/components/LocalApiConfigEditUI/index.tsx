import React, { FC, useEffect, useState } from 'react';
import * as print from 'pdf-to-printer';
import { PromptModal, useModals } from '../Modal';
import { Button, ButtonType } from '../Button';
import fs from 'fs';
import path from 'path';
import { Toggle } from '../Toggle';
import { app } from '@electron/remote';
import { Directories } from 'renderer/utils/Directories';

const LEGACY_SIMBRIDGE_DIRECTORY = 'flybywire-externaltools-simbridge';
const SIMBRIDGE_DIRECTORY = '/FlyByWireSim/Simbridge';

interface LocalApiConfiguration {
  server: {
    port: number;
  };
  printer: {
    enabled: boolean;
    printerName: string;
    fontSize: number;
    paperSize: string;
    margin: number;
  };
}

const localApiDefaultConfiguration: LocalApiConfiguration = {
  server: {
    port: 8380,
  },
  printer: {
    enabled: false,
    printerName: null,
    fontSize: 19,
    paperSize: 'A4',
    margin: 30,
  },
};

class LocalApiConfigurationHandler {
  private static get legacySimbridgeDirectory(): string {
    return path.join(Directories.inInstallLocation(LEGACY_SIMBRIDGE_DIRECTORY));
  }

  private static get simbridgeDirectory(): string {
    return path.join(app.getPath('documents'), SIMBRIDGE_DIRECTORY);
  }

  private static get simbridgeConfigPath(): string {
    const configPath = path.join(this.simbridgeDirectory, 'resources', 'properties.json');
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    // TODO remove this after a while once simbridge is released
    return path.join(this.legacySimbridgeDirectory, 'resources', 'properties.json');
  }

  static getConfiguration(): LocalApiConfiguration {
    if (fs.existsSync(this.simbridgeConfigPath)) {
      console.log(`Loading configuration from ${this.simbridgeConfigPath}`);

      return JSON.parse(fs.readFileSync(this.simbridgeConfigPath, 'utf8'));
    } else {
      console.log(`No configuration found at ${this.simbridgeConfigPath}`);

      if (fs.existsSync(path.join(this.simbridgeDirectory, 'resources'))) {
        console.log(`Creating configuration at ${this.simbridgeConfigPath}`);

        fs.writeFileSync(path.join(this.simbridgeConfigPath), JSON.stringify(localApiDefaultConfiguration));

        return localApiDefaultConfiguration;
      } else {
        throw new Error(`No configuration found and no directory to create it in`);
      }
    }
  }

  static saveConfiguration(propertyConfiguration: LocalApiConfiguration) {
    if (fs.existsSync(this.simbridgeConfigPath)) {
      fs.writeFileSync(this.simbridgeConfigPath, JSON.stringify(propertyConfiguration));
    }
  }
}

export const LocalApiConfigEditUI: FC = () => {
  const [config, setConfig] = useState(null as LocalApiConfiguration);
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    print.getPrinters().then((p) => setPrinters(p));

    try {
      const loaded = LocalApiConfigurationHandler.getConfiguration();
      setConfig(loaded);
    } catch (_) {
      /**/
    }
  }, []);

  const { showModal } = useModals();

  const handleReset = () => {
    showModal(
      <PromptModal
        title="Are you sure you want to do this?"
        bodyText="This will reset the configuration to the default values and cannot be undone."
        confirmColor={ButtonType.Danger}
        onConfirm={() => {
          LocalApiConfigurationHandler.saveConfiguration(localApiDefaultConfiguration);
          setConfig(localApiDefaultConfiguration);
        }}
      />,
    );
  };

  const handleConfigSave = () => {
    LocalApiConfigurationHandler.saveConfiguration(config);
    setConfig(LocalApiConfigurationHandler.getConfiguration());
  };

  const handleDiscard = () => {
    setConfig(LocalApiConfigurationHandler.getConfiguration());
  };

  if (config === null) {
    return (
      <div className="flex size-full items-center justify-center p-8">
        <h2 className="text-center text-white">
          Could not load configuration file. This likely means that you do not have SimBridge currently installed.
        </h2>
      </div>
    );
  }

  const changesBeenMade = JSON.stringify(config) !== JSON.stringify(LocalApiConfigurationHandler.getConfiguration());

  const isDefaultConfig = JSON.stringify(config) === JSON.stringify(localApiDefaultConfiguration);

  return (
    <div className="size-full overflow-y-scroll p-7">
      <div className="flex flex-row items-center justify-between gap-x-4">
        <h2 className="mb-0 font-bold text-white">SimBridge Settings</h2>

        <div className="flex flex-row space-x-4">
          {changesBeenMade && (
            <Button className="h-16" type={ButtonType.Danger} onClick={handleDiscard}>
              Discard
            </Button>
          )}

          {!isDefaultConfig && (
            <Button className="h-16" type={ButtonType.Danger} onClick={handleReset}>
              Reset
            </Button>
          )}

          {changesBeenMade && (
            <Button className="h-16" type={ButtonType.Positive} onClick={handleConfigSave}>
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="mb-0 text-white">Server</h3>

          <div className="divide-y divide-gray-600">
            <SimBridgeSettingItem name="Port">
              <input
                className="text-center"
                value={config.server.port}
                type="number"
                onChange={(event) =>
                  setConfig((old) => ({
                    ...old,
                    server: {
                      ...old.server,
                      port: parseFloat(event.target.value),
                    },
                  }))
                }
              />
            </SimBridgeSettingItem>
          </div>
        </div>
        <div>
          <h3 className="mb-0 text-white">Printer</h3>

          <div className="divide-y divide-gray-600">
            <SimBridgeSettingItem name="Enabled">
              <Toggle
                value={config.printer.enabled}
                onToggle={(value) =>
                  setConfig((old) => ({
                    ...old,
                    printer: {
                      ...old.printer,
                      enabled: value,
                    },
                  }))
                }
              />
            </SimBridgeSettingItem>

            <SimBridgeSettingItem name="Printer Name">
              <select
                value={config.printer.printerName ?? ''}
                onChange={(event) =>
                  setConfig((old) => ({
                    ...old,
                    printer: {
                      ...old.printer,
                      printerName: event.target.value ? event.target.value : null,
                    },
                  }))
                }
                className="w-auto cursor-pointer rounded-md border-2 border-navy bg-navy-light px-3.5 py-2.5 text-xl text-white outline-none"
              >
                <option value="">None</option>
                {printers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </SimBridgeSettingItem>

            <SimBridgeSettingItem name="Font Size">
              <input
                className="text-center text-xl"
                value={config.printer.fontSize}
                type="number"
                onChange={(event) =>
                  setConfig((old) => ({
                    ...old,
                    printer: {
                      ...old.printer,
                      fontSize: parseInt(event.target.value),
                    },
                  }))
                }
              />
            </SimBridgeSettingItem>

            <SimBridgeSettingItem name="Paper Size">
              <input
                className="text-center text-xl"
                value={config.printer.paperSize}
                onChange={(event) =>
                  setConfig((old) => ({
                    ...old,
                    printer: {
                      ...old.printer,
                      paperSize: event.target.value,
                    },
                  }))
                }
              />
            </SimBridgeSettingItem>

            <SimBridgeSettingItem name="Margin">
              <input
                className="text-center text-xl"
                value={config.printer.margin}
                type="number"
                onChange={(event) =>
                  setConfig((old) => ({
                    ...old,
                    printer: {
                      ...old.printer,
                      margin: parseFloat(event.target.value),
                    },
                  }))
                }
              />
            </SimBridgeSettingItem>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SimBridgeSettingItemProps {
  name: string;
}

const SimBridgeSettingItem: React.FC<SimBridgeSettingItemProps> = ({ name, children }) => {
  return (
    <div className="flex flex-row items-center justify-between py-4 text-xl text-white">
      <p className="m-0 p-0">{name}</p>

      {children}
    </div>
  );
};
