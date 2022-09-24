import React, { FC } from "react";
import { useHistory, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Addon, AddonTrack, ConfigurationAspect } from "../../../utils/InstallerConfiguration";
import { Track, Tracks } from "./TrackSelector";
import { ConfigurationAspectDisplay } from "./ConfigurationAspectDisplay";

import './index.css';

export interface ConfigureProps {
    routeAspectKey: string,
    selectedAddon: Addon,
    selectedTrack: () => AddonTrack,
    installedTrack: () => AddonTrack,
    onTrackSelection: (track: AddonTrack) => void,
}

export const Configure: FC<ConfigureProps> = ({ routeAspectKey, selectedAddon, selectedTrack, installedTrack, onTrackSelection }) => {
    const history = useHistory();
    const { aspectKey: currentAspectKey } = useParams<{ aspectKey: string; }>();

    let page;
    if (routeAspectKey === 'release-track') {
        page = (
            <>
                <h2 className="text-white font-bold">
                    Choose Your Version
                </h2>
                <div className="flex flex-row gap-x-8">
                    <div>
                        <Tracks>
                            {selectedAddon.tracks
                                .filter((track) => !track.isExperimental)
                                .map((track) => (
                                    <Track
                                        addon={selectedAddon}
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack() === track}
                                        isInstalled={installedTrack() === track}
                                        handleSelected={() => onTrackSelection(track)}
                                    />
                                ))}
                        </Tracks>
                        <span className="text-2xl text-quasi-white ml-0.5 mt-3 inline-block">
                                    Mainline Releases
                        </span>
                    </div>
                    <div>
                        <Tracks>
                            {selectedAddon.tracks
                                .filter((track) => track.isExperimental)
                                .map((track) => (
                                    <Track
                                        addon={selectedAddon}
                                        key={track.key}
                                        track={track}
                                        isSelected={selectedTrack() === track}
                                        isInstalled={installedTrack() === track}
                                        handleSelected={() => onTrackSelection(track)}
                                    />
                                ))}
                        </Tracks>

                        {selectedAddon.tracks.filter((track) => track.isExperimental).length > 0 && (
                            <span className="text-2xl text-quasi-white ml-0.5 mt-3 inline-block">
                                        Experimental versions
                            </span>
                        )}
                    </div>
                </div>
                {selectedTrack() && selectedTrack().description &&
                    <div className="mt-10">
                        <h2 className="text-white font-bold">Description</h2>
                        <p className="text-xl text-white font-manrope leading-relaxed">
                            <ReactMarkdown
                                className="text-xl text-white font-light font-manrope leading-relaxed"
                                children={selectedTrack().description}
                                linkTarget={"_blank"}
                            />
                        </p>
                    </div>
                }
            </>
        );
    } else {
        const aspect = selectedAddon.configurationAspects?.find((it) => it.key === routeAspectKey);

        if (!aspect) {
            console.error(`Tried to build page for unknown configuration aspect (addon=${selectedAddon.key}, aspectKey=${routeAspectKey})`);
            history.push('/addon-section/:publisher/main/configure/release-track');
            return null;
        }

        page = <ConfigurationAspectDisplay aspect={aspect} />;
    }

    return (
        <div className="w-full flex flex-col justify-between">
            <div className="flex flex-col h-full p-7 overflow-y-scroll">
                {page}
            </div>

            {selectedAddon.configurationAspects?.length > 0 && (
                <div className="w-full flex gap-x-12 bg-navy-light px-7 py-8">
                    <ConfigurationAspectTab aspect={{
                        key: 'release-track',
                        tabSupertitle: 'Configure',
                        tabTitle: 'Release Track',
                    } as ConfigurationAspect} selected={'release-track' === currentAspectKey} />

                    {selectedAddon.configurationAspects.map((aspect) => (
                        <ConfigurationAspectTab aspect={aspect} selected={aspect.key === currentAspectKey} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ConfigurationAspectTab: FC<{ aspect: ConfigurationAspect, selected: boolean }> = ({ aspect, selected }) => {
    const history = useHistory();

    const color = (selected ? 'text-quasi-white' : 'text-gray-300') + ' hover:text-cyan';

    const handleClick = () => {
        history.push(`/addon-section/:publisher/main/configure/${aspect.key}`);
    };

    return (
        <div className={`flex flex-col gap-y-0.5 pb-3 font-manrope font-medium ${color} cursor-pointer transition-color duration-200`} data-selected={selected} onClick={handleClick}>
            <span className="text-2xl">{aspect.tabSupertitle}</span>
            <span className="text-4xl configuration-aspect-tab-underline">{aspect.tabTitle}</span>
        </div>
    );
};
