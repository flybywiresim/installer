import React, { useState } from 'react';
import { GitVersions, PullInfo } from '@flybywiresim/api-client';

type PRItemProps = {
    pull: PullInfo,
    isSelected: boolean,
    setSelectedPull: CallableFunction,
}

const PRItem = (props: PRItemProps) => {
    return (
        <div className="flex flex-row text-white" onClick={() => props.setSelectedPull} key={props.pull.number}>
            <p className="text-white ml-2">{props.pull.number}</p>
            <p className="text-white ml-2">{props.pull.title}</p>
            <p className="text-white ml-2">{props.pull.author}</p>
            <p>{props.isSelected ? 'active' : 'unactive'}</p>
        </div>
    );
};

const QAPage = () => {
    const [pulls, setPulls] = useState<PullInfo[]>([]);
    const [selectedPull, setSelectedPull] = useState<number>(0);

    const RefreshPulls = () => {
        GitVersions.getPulls('flybywiresim', 'a32nx')
            .then(r => setPulls(r));
    };

    const isSelected = (pullNumber: number) => {
        return selectedPull === pullNumber;
    };

    return (
        <div className="m-6">
            <div className="flex flex-col">
                <button type="button" className="text-white text-left" onClick={() => RefreshPulls()}>Refresh Pulls</button>
                {pulls.reverse().map(pull =>
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
