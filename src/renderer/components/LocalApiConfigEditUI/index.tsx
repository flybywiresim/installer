import React, { FC, useEffect, useState } from 'react';
import * as print from 'pdf-to-printer';
import { PromptModal, useModals } from '../Modal';
import { ButtonType } from '../Button';
import fs from 'fs';
import path from 'path';
import { Directories } from 'renderer/utils/Directories';
import { Toggle } from '../Toggle';

const SIMBRIDGE_DIRECTORY = 'flybywire-externaltools-simbridge';

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
        paperSize: "A4",
        margin: 30,
    },
};

class LocalApiConfigurationHandler {
    private static get simbridgeDirectory(): string {
        return path.join(Directories.inCommunity(SIMBRIDGE_DIRECTORY));
    }

    private static get simbridgeConfigPath(): string {
        return path.join(this.simbridgeDirectory, 'resources', 'properties.json');
    }

    static getConfiguration(): LocalApiConfiguration {
        if (fs.existsSync(this.simbridgeConfigPath)) {
            console.log(`Loading configuration from ${this.simbridgeConfigPath}`);

            return JSON.parse(fs.readFileSync(this.simbridgeConfigPath, "utf8"));
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
        print.getPrinters().then(p => setPrinters(p));

        try {
            const loaded = LocalApiConfigurationHandler.getConfiguration();
            setConfig(loaded);
        } catch (_) {/**/ }
    }, []);

    const { showModal } = useModals();

    const handleReset = () => {
        showModal(
            <PromptModal
                title='Are you sure you want to do this?'
                bodyText='This will reset the configuration to the default values and cannot be undone.'
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
            <div className='h-full w-full flex items-center justify-center p-8'>
                <h2 className='text-center text-white'>
                    Could not load configuration file. This likely means that you do not have the Local API currently installed.
                </h2>
            </div>
        );
    }

    const changesBeenMade = JSON.stringify(config)
        !== JSON.stringify(LocalApiConfigurationHandler.getConfiguration());

    const isDefaultConfig = JSON.stringify(config) === JSON.stringify(localApiDefaultConfiguration);

    return (
        <div className="h-full p-7 overflow-y-scroll w-full">
            <div className='flex flex-row items-center justify-between gap-x-4'>
                <h2 className="font-bold mb-0 text-white">SimBridge Settings</h2>

                <div className='flex flex-row space-x-4'>
                    {changesBeenMade && (
                        <button
                            className='flex items-center justify-center px-8 py-2 border-2 border-utility-red rounded-md transition duration-100 bg-utility-red hover:bg-navy text-white'
                            onClick={handleDiscard}
                        >
                            <p>Discard</p>
                        </button>
                    )}

                    {!isDefaultConfig && (
                        <button
                            className='flex items-center justify-center px-8 py-2 border-2 border-utility-red rounded-md transition duration-100 bg-utility-red hover:bg-navy text-white'
                            onClick={handleReset}
                        >
                            <p>Reset</p>
                        </button>
                    )}

                    {changesBeenMade && (
                        <button
                            className='flex items-center justify-center px-16 py-2 border-2 border-utility-green rounded-md transition duration-100 bg-utility-green hover:bg-navy text-white'
                            onClick={handleConfigSave}
                        >
                            <p>Save</p>
                        </button>
                    )}
                </div>
            </div>

            <div className='space-y-4 mt-4'>
                <div>
                    <h3 className='text-white mb-0'>Server</h3>

                    <div className='divide-y divide-gray-600'>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Port</p>
                            <input className="text-center" value={config.server.port} type="number" onChange={event => setConfig(old => ({
                                ...old,
                                server: {
                                    ...old.server,
                                    port: parseFloat(event.target.value),
                                },
                            }))}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className='text-white mb-0'>Printer</h3>

                    <div className='divide-y divide-gray-600'>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Enabled</p>
                            <Toggle value={config.printer.enabled} onToggle={value => setConfig(old => ({
                                ...old,
                                printer: {
                                    ...old.printer,
                                    enabled: value,
                                },
                            }))} />
                        </div>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Printer Name</p>
                            <select
                                value={config.printer.printerName ?? ''}
                                onChange={event => setConfig(old => ({
                                    ...old,
                                    printer: {
                                        ...old.printer,
                                        printerName: event.target.value ? event.target.value : null,
                                    },
                                }))}
                                className="text-base text-white w-auto px-3.5 py-2.5 rounded-md outline-none bg-navy-light border-2 border-navy cursor-pointer"
                            >
                                <option value=''>None</option>
                                {printers.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Font Size</p>
                            <input className="text-center" value={config.printer.fontSize} type="number" onChange={event => setConfig(old => ({
                                ...old,
                                printer: {
                                    ...old.printer,
                                    fontSize: parseInt(event.target.value),
                                },
                            }))}
                            />
                        </div>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Paper Size</p>
                            <input className="text-center" value={config.printer.paperSize} onChange={event => setConfig(old => ({
                                ...old,
                                printer: {
                                    ...old.printer,
                                    paperSize: event.target.value,
                                },
                            }))}
                            />
                        </div>
                        <div className='flex flex-row items-center justify-between text-white py-4'>
                            <p>Margin</p>
                            <input className="text-center" value={config.printer.margin} type="number" onChange={event => setConfig(old => ({
                                ...old,
                                printer: {
                                    ...old.printer,
                                    margin: parseFloat(event.target.value),
                                },
                            }))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
