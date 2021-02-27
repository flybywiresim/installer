import React from "react";
import styled from "styled-components";
import { colors, smallCard } from "renderer/style/theme";
import { ModTrack } from "renderer/components/App";

/**
 * Container for mod tracks
 */
export const Tracks = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  column-gap: 1em;
`;

type TrackProps = {
    className?: string,
    track: ModTrack,
    latestVersionName: string,
    isSelected: boolean,
    isInstalled: boolean,
    // eslint-disable-next-line no-unused-vars
    onSelected(track: ModTrack): void,
};

const BaseTrack: React.FC<TrackProps> = ({ isSelected, onSelected, track, latestVersionName }) =>
    (
        <div
            className={`w-60 flex flex-col ${isSelected ? 'bg-navy-lightest' : 'bg-navy-lighter'} border ${isSelected ? 'border-teal-light-contrast' : 'border-gray-700 hover:border-gray-500'} px-5 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer`}
            onClick={() => onSelected(track)}
        >
            <span className="text-xl text-gray-50">{track.name}</span>
            <span className="text-lg text-teal-50 -mt-0.5"><code>{latestVersionName}</code></span>
        </div>
    );

/**
 * Visually displays of a mod track
 */
export const Track = styled(BaseTrack)`
  ${smallCard};

  width: 13em;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  cursor: pointer;

  :after {
    content:'';
    position: absolute;
    top: ${props => props.isSelected ? '0% !important' : 'calc(50% - 5px)'};
    left: 0;
    width: ${props => props.isSelected ? '10px' : '5px'};
    height: ${props => props.isSelected ? '100% !important' : '10px'};
    border-left: 5px solid;
    border-color: ${props => props.isInstalled ? colors.cardInstalled : props.isSelected ? colors.cardSelected : colors.mutedTextDark};
    border-radius: 5px;
    transition-property: height, top;
    transition-duration: .1s;
  }

  &:hover:after {
    top: calc(50% - 10px);
    height: 20px;
  }
`;
