import React, { useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { shell } from "electron";
import { AddonVersion } from "renderer/utils/InstallerConfiguration";
import dateFormat from "dateformat";
import settings from "common/settings";

/**
 * Container for versions
 */
export const Versions = styled.div`
  display: flex;
  flex-direction: column;
`;

const GITHUB_RELEASE_BASE_URL = 'https://github.com/flybywiresim/a32nx/releases/tag/';

type VersionProps = {
    index: number,
    className?: string,
    version: AddonVersion
};

const VersionBase: React.FC<VersionProps> = (props) => {
    const ref = useRef<HTMLDivElement>();

    const [versionContainerHeight, setVersionContainerHeight] = useState(0);

    useEffect(() => {
        const height = ref.current.clientHeight;

        setVersionContainerHeight(height);
    }, [ref.current?.clientHeight]);

    const openReleasePage = () => shell.openExternal(GITHUB_RELEASE_BASE_URL + props.version.title);

    return (
        <div ref={ref} className={props.className} onClick={openReleasePage}>
            <VersionLine>
                <path d={`m 10 ${props.index == 0 ? '15' : 0} l 0 ${versionContainerHeight}`} />

                <circle cx={10} cy={15} r={5} />
            </VersionLine>

            <VersionTitle>{props.version.title}</VersionTitle>
            <VersionDate>{dateFormat(props.version.date, settings.get('mainSettings.dateLayout') as string)}</VersionDate>
            <VersionType>{props.version.type} version</VersionType>
        </div>
    );
};

/**
 * Visually displays a addon release
 */
export const Version = styled(VersionBase)`
  display: grid;
  grid-template-columns: [start] 1fr [middle] 6fr [end] 3fr;
  grid-template-rows: [start] 30px [middle] auto;

  letter-spacing: .04em !important;
  
  --timeline-node-color: ${props => props.index === 0 ? 'white' : '#757575'};
  
  --title-color: ${props => props.index === 0 ? 'white' : '#929292'};
  --text-color: ${props => props.index === 0 ? 'white' : '#929292'};
  &:hover {
    --title-color: #b3b3b3;
    --text-color: #b3b3b3;
    cursor: pointer;
  }

  & > * {
    margin: 0;
  }
`;

const VersionLine = styled.svg`
  grid-column: start / middle;
  stroke: #757575;
  fill: #757575;
  stroke-width: 1;
  
  circle {
    stroke: var(--timeline-node-color);
    fill: var(--timeline-node-color);
  }
`;

const VersionTitle = styled.h4`
  grid-column: middle / end;
  grid-row: start / middle;
  color: var(--title-color) !important;
`;

const VersionDate = styled.h6`
  grid-column: end;
  grid-row: start / middle;
  vertical-align: middle;
  line-height: 30px;
  color: var(--text-color) !important;
`;

const VersionType = styled.h5`
  grid-column: middle / end;
  grid-row: middle;
  margin-bottom: 1em;
  color: var(--text-color) !important;
`;
