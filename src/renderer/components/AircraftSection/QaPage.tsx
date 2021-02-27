import React, { useState } from 'react';
import { GitVersions, PullInfo, PullLabel } from '@flybywiresim/api-client';

import getColorsFromBase from '../../utils/LabelColorGenerator';
import { Mod } from "renderer/components/App";

type PrItemProps = {
    pull: PullInfo,
    isSelected: boolean,
    setSelectedPull: () => void,
}

const PrLabel: React.FC<{label: PullLabel}> = ({ label }) => {
    const { background, foreground: color } = getColorsFromBase(label.color);

    return (
        <span
            className="ml-2 text-text-normal text-sm px-2.5 py-0.5 rounded-full"
            style={{ background, color }}
        >{label.name}</span>
    );
};

const PrItem = (props: PrItemProps) =>
    (
        <div
            className="flex flex-row rounded-md mb-2 bg-card-bg border-card-bg"
            key={props.pull.number}
            onClick={() => props.setSelectedPull()}
        >
            {props.isSelected ?
                <div className="w-1 bg-card-active rounded-l-md"/>
                :
                <div className="w-1 bg-card-inactive rounded-l-md"/>
            }
            <div className="flex flex-col">
                <div className="flex flex-row pt-1 pl-1 mb-1">
                    <span className="ml-1 text-text-muted">{`#${props.pull.number}`}</span>
                    <span className="ml-2 text-text-normal">{props.pull.title}</span>
                </div>
                <div className="flex flex-row mb-1.5">
                    {props.pull.labels.length > 0 ?
                        props.pull.labels.map(label =>
                            <PrLabel label={label}/>
                        )
                        : <span className="px-2 py-0.5 text-text-muted text-sm">No Labels</span>
                    }
                </div>
            </div>
            {props.isSelected ?
                <div className="flex bg-card-active w-20 rounded-r-md ml-auto items-center">
                    <p className="flex-grow mb-0 text-center text-lg text-text-normal">Install</p>
                </div>
                : <></>
            }
        </div>
    );

const QaPage: React.FC<{mod: Mod}> = ({ mod }) => {
    const [pulls, setPulls] = useState<PullInfo[]>([]);
    const [selectedPull, setSelectedPull] = useState<number>(0);

    const refreshPulls = () => {
        GitVersions.getPulls('flybywiresim', mod.key)
            .then((r: PullInfo[]) => setPulls(r.reverse()));
    };

    const isSelected = (pullNumber: number) => {
        return selectedPull === pullNumber;
    };

    return (
        <div className="mx-6 my-2">
            <div className="flex flex-col">
                <div className="w-40 mb-4">
                    <p
                        className="text-white mb-0 text-center bg-card-bg rounded-md border-5"
                        onClick={() => refreshPulls()}
                    >Refresh Pulls</p>
                </div>
                {pulls.map(pull =>
                    !pull.isDraft ?
                        <PrItem
                            pull={pull}
                            isSelected={isSelected(pull.number)}
                            setSelectedPull={() => setSelectedPull(pull.number)}
                        />
                        : <></>
                )}
            </div>
        </div>
    );
};

export default QaPage;
