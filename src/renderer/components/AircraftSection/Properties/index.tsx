import React, { useState } from 'react';
import { Link, Route, useParams } from 'react-router-dom';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import fs from 'fs';
import path from 'path';
import { Directories } from 'renderer/utils/Directories';
import { Toggle } from '@flybywiresim/react-components';
import { ArrowLeft, ChevronRight } from 'react-bootstrap-icons';
import { PromptModal, useModals } from 'renderer/components/Modal';

const correctCamelCase = (str: string) => str.split(/(?=[A-Z])/).map(str => str[0].toUpperCase() + str.slice(1)).join(' ');

class PropertyConfigurationHandler {
    static getPropertyConfiguration(propertyName: string, addon: Addon): Record<string, unknown> {
        const property = addon.properties.find(property => property.name === propertyName);

        const parentDir = path.join(Directories.community(),addon.targetDirectory, property.parentPath);

        if (fs.existsSync(path.join(parentDir, `${property.name}.json`))) {
            console.log(`Loading ${property.name} configuration from ${parentDir}`);

            const config = JSON.parse(fs.readFileSync(path.join(parentDir, `${property.name}.json`), "utf8"));

            const missingKeys = Object.keys(property.schema).filter(key => !(key in config));

            if (missingKeys.length > 0) {
                console.log(`${property.name} configuration is missing some properties.`);

                missingKeys.forEach(key => config[key] = property.schema[key]);
                PropertyConfigurationHandler.savePropertyConfiguration(propertyName, addon, config);
            }

            const extranneousKeys = Object.keys(config).filter(key => !(key in property.schema));

            if (extranneousKeys.length > 0) {
                console.log(`${property.name} configuration has some extraneous properties.`);

                extranneousKeys.forEach(key => delete config[key]);
                PropertyConfigurationHandler.savePropertyConfiguration(propertyName, addon, config);
            }

            return config;
        } else {
            console.log(`No ${property.name} configuration found in ${parentDir}`);

            if (fs.existsSync(parentDir)) {
                console.log(`Creating ${property.name} configuration in ${parentDir}`);

                fs.writeFileSync(path.join(Directories.community(),addon.targetDirectory, property.parentPath, `${property.name}.json`), JSON.stringify(property.schema));
            }
        }

        console.log('Returning Default Configuration', property.schema);

        return property.schema;
    }

    static savePropertyConfiguration(propertyName: string, addon: Addon, propertyConfiguration: unknown) {
        const property = addon.properties.find(property => property.name === propertyName);
        const configJsonPath = path.join(Directories.community(),addon.targetDirectory, property.parentPath,`${property.name}.json`);

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

interface PropertyEditUI {
    addon : Addon;
}

const PropertyEditUI = ({ addon }: PropertyEditUI) => {
    const { publisherName, propertyName } = useParams<{ publisherName: string, propertyName: string }>();

    const { showModal } = useModals();

    const [config, setConfig] = useState(PropertyConfigurationHandler.getPropertyConfiguration(propertyName, addon));

    const property = addon.properties.find(property => property.name === propertyName);
    const displayName = property.alias ?? propertyName;

    const handleConfigSave = () => {
        PropertyConfigurationHandler.savePropertyConfiguration(propertyName, addon, config);
    };

    const handleDiscard = () => {
        const currentlySavedConfig = PropertyConfigurationHandler.getPropertyConfiguration(propertyName, addon);

        PropertyConfigurationHandler.savePropertyConfiguration(propertyName, addon, currentlySavedConfig);
        setConfig(currentlySavedConfig);
    };

    const handleReset = () => {
        showModal(
            <PromptModal
                title='Are you sure you want to do this?'
                bodyText='This will reset the configuration to the default values and cannot be undone.'
                confirmColor='red'
                onConfirm={() => {
                    PropertyConfigurationHandler.savePropertyConfiguration(propertyName, addon, property.schema);
                    setConfig(property.schema);
                }}/>
        );
    };

    const changesBeenMade = JSON.stringify(config) !== JSON.stringify(PropertyConfigurationHandler.getPropertyConfiguration(propertyName, addon));

    return (
        <div>
            <div className='flex flex-row items-center justify-between gap-x-4'>
                <Link to={`/aircraft-section/${publisherName}/main/properties`} >
                    <div className='flex flex-row items-center space-x-4 text-white transition duration-100 hover:text-cyan'>
                        <ArrowLeft size={20}/>
                        <h2 className="text-current font-extrabold mb-0">Properties - {displayName}</h2>
                    </div>
                </Link>

                <div className='flex flex-row space-x-4'>
                    {changesBeenMade && (
                        <>
                            <button
                                className='flex items-center justify-center px-8 py-2 border-2 border-red-500 rounded-md transition duration-100 bg-red-500 text-navy hover:bg-navy hover:text-red-500'
                                onClick={handleDiscard}
                            >
                                <p>Discard</p>
                            </button>

                            <button
                                className='flex items-center justify-center px-8 py-2 border-2 border-red-500 rounded-md transition duration-100 bg-red-500 text-navy hover:bg-navy hover:text-red-500'
                                onClick={handleReset}
                            >
                                <p>Reset</p>
                            </button>

                            <button
                                className='flex items-center justify-center px-16 py-2 border-2 border-green-400 rounded-md transition duration-100 bg-green-400 text-navy hover:bg-navy hover:text-green-400'
                                onClick={handleConfigSave}
                            >
                                <p>Save</p>
                            </button>
                        </>
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

interface PropertiesProps {
    addon: Addon;
}

export const Properties = ({ addon }: PropertiesProps) => {
    const { publisherName } = useParams<{publisherName: string}>();

    return (
        <div className="h-full p-7 overflow-y-scroll w-full">
            <Route exact path={`/aircraft-section/${publisherName}/main/properties/`}>
                <h2 className="text-white font-extrabold">Properties</h2>

                <div className='space-y-16'>
                    {addon.properties.map((property) => (
                        <Link to={`/aircraft-section/${publisherName}/main/properties/${property.name}`}>
                            <div className="flex flex-row items-center justify-between rounded-md bg-navy p-7 border-2 border-transparent transition duration-100 hover:border-cyan">
                                <h2 className='text-white mb-0'>{property.alias ?? property.name}</h2>

                                <ChevronRight className="text-white"size={30} />
                            </div>
                        </Link>
                    ))}
                </div>
            </Route>

            <Route path={`/aircraft-section/:publisherName/main/properties/:propertyName`}>
                <PropertyEditUI addon={addon}/>
            </Route>
        </div>
    );
};
