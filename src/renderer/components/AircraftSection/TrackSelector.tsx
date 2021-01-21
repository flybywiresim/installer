import React, { useEffect, useState } from "react";
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
    isSelected: boolean,
    // eslint-disable-next-line no-unused-vars
    onSelected(track: ModTrack): void,
};

const BaseTrack: React.FC<TrackProps> = (props) => {
    const [latestVersionName, setLatestVersionName] = useState('');

    useEffect(() => {
        props.track.latestVersionName.then(name => {
            typeof name === 'string' ? setLatestVersionName(name) : setLatestVersionName(name.title);
        });
    });

    return (
        <div className={props.className} onClick={() => props.onSelected(props.track)}>
            <TrackTitle>{props.track.name}</TrackTitle>
            <TrackState><code>{latestVersionName}</code></TrackState>
        </div>
    );
};

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
 
  border: solid transparent 2px;
  :after {
    content:'';
    position: absolute;
    top:5%;
    left:-2px;
    width: 5px;
    height: 90%;
    background-color: ${props => props.isSelected ? `${colors.cardSelected}` : `transparent` } ;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: 200ms;
  }
  
  border-color: ${colors.cardBackground};
  &:hover {
    border-color: ${colors.cardBackgroundHover};
  }
  
  transition: border-color linear 200ms;
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
