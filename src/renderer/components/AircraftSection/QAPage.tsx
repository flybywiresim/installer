import React, { useState } from 'react';
import { GitVersions, PullInfo } from '@flybywiresim/api-client';

type PRItemProps = {
    pull: PullInfo,
    isSelected: boolean,
    setSelectedPull: () => void,
}

const PRItem = (props: PRItemProps) => {
    return (
        <>
            <div
                className="flex flex-row rounded-md mb-2 bg-card-bg border-card-bg"
                key={props.pull.number}
                onClick={() => props.setSelectedPull()}
            >
                {props.isSelected ?
                    <div className="w-1 bg-card-active rounded-l-md" />
                    :
                    <div className="w-1 bg-card-inactive rounded-l-md" />
                }
                <div className="flex flex-row p-1">
                    <p className="ml-1 mb-0 text-text-muted">{`#${props.pull.number}`}</p>
                    <p className="ml-2 mb-0 text-text-normal">{props.pull.title}</p>
                </div>
                {props.isSelected ?
                    <div className="flex bg-card-active w-20 rounded-r-md ml-auto items-center">
                        <p className="flex-grow mb-0 text-center text-lg text-text-normal">Install</p>
                    </div>
                    : <></>
                }
            </div>

        </>
    );
};

const QAPage = () => {
    const [pulls, setPulls] = useState<PullInfo[]>([]);
    const [selectedPull, setSelectedPull] = useState<number>(0);

    const RefreshPulls = () => {
        GitVersions.getPulls('flybywiresim', 'a32nx')
            .then((r: PullInfo[]) => setPulls(r.reverse()));
    };

    const isSelected = (pullNumber: number) => {
        return selectedPull === pullNumber;
    };

    return (
        <div className="m-6">
            <div className="flex flex-col">
                <div className="w-40 mb-4">
                    <p
                        className="text-white mb-0 text-center bg-card-bg rounded-md border-5"
                        onClick={() => RefreshPulls()}
                    >Refresh Pulls</p>
                </div>
                {pulls.map(pull =>
                    <PRItem
                        pull={pull}
                        isSelected={isSelected(pull.number)}
                        setSelectedPull={() => setSelectedPull(pull.number)}
                    />
                )}
            </div>
        </div>
    );
};

export default QAPage;
