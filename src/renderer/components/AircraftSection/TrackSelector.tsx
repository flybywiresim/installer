import React from "react";
import styled from "styled-components";
import { colors, noPadding, smallCard } from "renderer/style/theme";
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

const BaseTrack: React.FC<TrackProps> = ({ className, track, latestVersionName, onSelected }) =>
    (
        <div className={className} onClick={() => onSelected(track)}>
            <TrackTitle>{track.name}</TrackTitle>
            <TrackState><code>{latestVersionName}</code></TrackState>
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

const TrackTitle = styled.h5`
  color: ${colors.titleContrast} !important;

  ${noPadding};
`;

const TrackState = styled.span`
  font-size: 1.1em;
  color: ${colors.title} !important;

  ${noPadding};

  margin-top: -.3em;
`;
