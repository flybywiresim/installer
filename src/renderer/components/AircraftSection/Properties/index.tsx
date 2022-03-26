import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Publisher } from 'renderer/utils/InstallerConfiguration';
import fs from 'fs';
import path from 'path';
import { Directories } from 'renderer/utils/Directories';
import { Toggle } from '@flybywiresim/react-components';
import { ArrowLeft } from 'react-bootstrap-icons';
import { PromptModal, useModals } from 'renderer/components/Modal';
import { useAppSelector } from 'renderer/redux/store';

const correctCamelCase = (str: string) => str.split(/(?=[A-Z])/).map(str => str[0].toUpperCase() + str.slice(1)).join(' ');

class PublisherConfigurationHandler {
    static getPropertyConfiguration(propertyName: string, publisher: Publisher): Record<string, unknown> {
        const property = publisher.configurations.find(property => property.name === propertyName);
        const prospectiveConfigurationFilePath = path.join(Directories.community(),`${property.name}.json`);

        if (fs.existsSync(prospectiveConfigurationFilePath)) {
            console.log(`Loading ${property.name} configuration from ${Directories.community()}`);

            const config = JSON.parse(fs.readFileSync(path.join(prospectiveConfigurationFilePath), "utf8"));

            const missingKeys = Object.keys(property.defaults).filter(key => !(key in config));

            if (missingKeys.length > 0) {
                console.log(`${property.name} configuration is missing some properties.`);

                missingKeys.forEach(key => config[key] = property.defaults[key]);
                PublisherConfigurationHandler.savePropertyConfiguration(propertyName, publisher, config);
            }

            const extranneousKeys = Object.keys(config).filter(key => !(key in property.defaults));

            if (extranneousKeys.length > 0) {
                console.log(`${property.name} configuration has some extraneous properties.`);

                extranneousKeys.forEach(key => delete config[key]);
                PublisherConfigurationHandler.savePropertyConfiguration(propertyName, publisher, config);
            }

            return config;
        } else {
            console.log(`No ${property.name} configuration found in ${Directories.community()}`);

            if (fs.existsSync(Directories.community())) {
                console.log(`Creating ${property.name} configuration in ${Directories.community()}`);

                fs.writeFileSync(
                    path.join(prospectiveConfigurationFilePath),
                    JSON.stringify(property.defaults));
            }
        }

        console.log('Returning Default Configuration', property.defaults);

        return property.defaults;
    }

    static savePropertyConfiguration(propertyName: string, publisher: Publisher, propertyConfiguration: unknown) {
        const property = publisher.configurations.find(property => property.name === propertyName);
        const configJsonPath = path.join(Directories.community(),`${property.name}.json`);

        if (fs.existsSync(configJsonPath)) {
            fs.writeFileSync(configJsonPath, JSON.stringify(propertyConfiguration));
        }
    }
}

interface InputElementProps {
    value: unknown;
    onChange: (value: unknown) => void;
}

const InputElement = ({ value, onChange }: InputElementProps) => {
    switch (typeof value) {
        case "boolean":
            return <Toggle value={value as boolean} onToggle={onChange}/>;
        case "number":
            return <input className="text-center" value={value} type="number" onChange={event => onChange(parseFloat(event.target.value))}/>;
        case "string":
            return <input className="text-center" value={value} type="text" onChange={event => onChange(event.target.value)}/>;
        default:
            return <input className="text-center" value={value as string} type="text" onChange={event => onChange(event.target.value)}/>;
    }
};

export const PublisherConfigurationEditUI = (): JSX.Element => {
    const { publisherName, configurationName } = useParams<{ publisherName: string, configurationName: string }>();

    const { showModal } = useModals();

    const { publishers } = useAppSelector(state => state.configuration);
    const publisher = publishers.find(publisher => publisher.name === publisherName);

    const [config, setConfig] = useState(PublisherConfigurationHandler.getPropertyConfiguration(configurationName, publisher));

    const configuration = publisher.configurations.find(conf => conf.name === configurationName);
    const displayName = configuration.alias ?? configurationName;

    const handleConfigSave = () => {
        PublisherConfigurationHandler.savePropertyConfiguration(configurationName, publisher, config);
        setConfig({ ...config });
    };

    const handleDiscard = () => {
        const currentlySavedConfig = PublisherConfigurationHandler.getPropertyConfiguration(configurationName, publisher);

        PublisherConfigurationHandler.savePropertyConfiguration(configurationName, publisher, currentlySavedConfig);
        setConfig(currentlySavedConfig);
    };

    const handleReset = () => {
        showModal(
            <PromptModal
                title='Are you sure you want to do this?'
                bodyText='This will reset the configuration to the default values and cannot be undone.'
                confirmColor='red'
                onConfirm={() => {
                    PublisherConfigurationHandler.savePropertyConfiguration(configurationName, publisher, configuration.defaults);
                    setConfig(configuration.defaults);
                }}
            />
        );
    };

    const changesBeenMade = JSON.stringify(config)
        !== JSON.stringify(PublisherConfigurationHandler.getPropertyConfiguration(configurationName, publisher));

    const isDefaultConfig = JSON.stringify(config) === JSON.stringify(configuration.defaults);

    return (
        <div className="h-full p-7 overflow-y-scroll w-full">
            <div className='flex flex-row items-center justify-between gap-x-4'>
                <h2 className="font-extrabold mb-0 text-white">Configuration - {displayName}</h2>

                <div className='flex flex-row space-x-4'>
                    {changesBeenMade && (
                        <button
                            className='flex items-center justify-center px-8 py-2 border-2 border-red-500 rounded-md transition duration-100 bg-red-500 text-navy hover:bg-navy hover:text-red-500'
                            onClick={handleDiscard}
                        >
                            <p>Discard</p>
                        </button>
                    )}

                    {!isDefaultConfig && (
                        <button
                            className='flex items-center justify-center px-8 py-2 border-2 border-red-500 rounded-md transition duration-100 bg-red-500 text-navy hover:bg-navy hover:text-red-500'
                            onClick={handleReset}
                        >
                            <p>Reset</p>
                        </button>
                    )}

                    {changesBeenMade && (
                        <button
                            className='flex items-center justify-center px-16 py-2 border-2 border-green-400 rounded-md transition duration-100 bg-green-400 text-navy hover:bg-navy hover:text-green-400'
                            onClick={handleConfigSave}
                        >
                            <p>Save</p>
                        </button>
                    )}
                </div>
            </div>

            <div className='space-y-4 mt-4'>
                {Object.keys(config).map((name, index) => {
                    let component: JSX.Element;

                    if (typeof config[name] === "object") {
                        component = (
                            <div>
                                <h3 className='text-white mb-0'>{correctCamelCase(name)}</h3>

                                <div className='divide-y divide-gray-600'>
                                    {Object.entries(config[name]).map(([key, value]) => {
                                        return (
                                            <div className='flex flex-row items-center justify-between text-white py-4'>
                                                <p>{correctCamelCase(key)}</p>

                                                <InputElement
                                                    value={value}
                                                    onChange={newValue => {
                                                        const temp = JSON.parse(JSON.stringify(config));
                                                        temp[name][key] = newValue;
                                                        setConfig(temp);
                                                    }}/>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    } else {
                        component = (
                            <div className='flex flex-row items-center justify-between text-white'>
                                <p>{correctCamelCase(name)}</p>

                                <InputElement
                                    value={config[name]}
                                    onChange={newValue => {
                                        const temp = JSON.parse(JSON.stringify(config));
                                        temp[name] = newValue;
                                        setConfig(temp);
                                    }}/>
                            </div>
                        );
                    }

                    return (
                        <>
                            {component}
                            {index < Object.keys(config).length - 1 && <div className='h-1 w-full bg-gray-600 my-4'/>}
                        </>
                    );
                })}
            </div>
        </div>
    );
};
