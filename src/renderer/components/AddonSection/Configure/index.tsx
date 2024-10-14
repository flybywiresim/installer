import React, { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Addon, AddonTrack, ConfigurationAspect } from 'renderer/utils/InstallerConfiguration';
import { Track, Tracks } from './TrackSelector';
import { ConfigurationAspectDisplay } from 'renderer/components/AddonSection/Configure/ConfigurationAspectDisplay';

import './index.css';
import rehypeRaw from 'rehype-raw';

export interface ConfigureProps {
  routeAspectKey: string;
  selectedAddon: Addon;
  selectedTrack: AddonTrack | null;
  installedTrack: AddonTrack | null;
  onTrackSelection: (track: AddonTrack) => void;
}

export const Configure: FC<ConfigureProps> = ({
  routeAspectKey,
  selectedAddon,
  selectedTrack,
  installedTrack,
  onTrackSelection,
}) => {
  const history = useHistory();
  const { aspectKey: currentAspectKey } = useParams<{ aspectKey: string }>();

  let page;
  if (routeAspectKey === 'release-track') {
    page = (
      <>
        <h2 className="font-bold text-white">Choose Your Version</h2>
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
                    isSelected={selectedTrack?.key === track.key}
                    isInstalled={installedTrack?.key === track.key}
                    handleSelected={() => onTrackSelection(track)}
                  />
                ))}
            </Tracks>
            <span className="ml-0.5 mt-3 inline-block text-2xl text-quasi-white">Mainline Releases</span>
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
                    isSelected={selectedTrack?.key === track.key}
                    isInstalled={installedTrack?.key === track.key}
                    handleSelected={() => onTrackSelection(track)}
                  />
                ))}
            </Tracks>

            {selectedAddon.tracks.filter((track) => track.isExperimental).length > 0 && (
              <span className="ml-0.5 mt-3 inline-block text-2xl text-quasi-white">Experimental versions</span>
            )}
          </div>
        </div>
        {selectedTrack && selectedTrack.description && (
          <div className="mt-10">
            <h2 className="font-bold text-white">Description</h2>
            <p className="font-manrope text-xl leading-relaxed text-white">
              <ReactMarkdown
                className="font-manrope text-xl font-light leading-relaxed text-white"
                linkTarget={'_blank'}
                rehypePlugins={[rehypeRaw]}
              >
                {selectedTrack.description}
              </ReactMarkdown>
            </p>
          </div>
        )}
      </>
    );
  } else {
    const aspect = selectedAddon.configurationAspects?.find((it) => it.key === routeAspectKey);

    if (!aspect) {
      console.error(
        `Tried to build page for unknown configuration aspect (addon=${selectedAddon.key}, aspectKey=${routeAspectKey})`,
      );
      history.push('/addon-section/:publisher/main/configure/release-track');
      return null;
    }

    page = <ConfigurationAspectDisplay aspect={aspect} />;
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="flex h-full flex-col overflow-y-scroll p-7">{page}</div>

      {selectedAddon.configurationAspects?.length > 0 && (
        <div className="flex w-full gap-x-12 bg-navy-light px-7 py-8">
          <ConfigurationAspectTab
            aspect={
              {
                key: 'release-track',
                tabSupertitle: 'Configure',
                tabTitle: 'Release Track',
              } as ConfigurationAspect
            }
            selected={'release-track' === currentAspectKey}
          />

          {selectedAddon.configurationAspects.map((aspect) => (
            <ConfigurationAspectTab key={aspect.key} aspect={aspect} selected={aspect.key === currentAspectKey} />
          ))}
        </div>
      )}
    </div>
  );
};

const ConfigurationAspectTab: FC<{ aspect: ConfigurationAspect; selected: boolean }> = ({ aspect, selected }) => {
  const history = useHistory();

  const color = (selected ? 'text-quasi-white' : 'text-gray-300') + ' hover:text-cyan';

  const handleClick = () => {
    history.push(`/addon-section/:publisher/main/configure/${aspect.key}`);
  };

  return (
    <div
      className={`flex flex-col gap-y-0.5 pb-3 font-manrope font-medium ${color} transition-color cursor-pointer duration-200`}
      data-selected={selected}
      onClick={handleClick}
    >
      <span className="text-2xl">{aspect.tabSupertitle}</span>
      <span className="configuration-aspect-tab-underline text-4xl">{aspect.tabTitle}</span>
    </div>
  );
};
