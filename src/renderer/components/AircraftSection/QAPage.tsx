import React, { useState } from 'react';
import { GitVersions, PullInfo } from '@flybywiresim/api-client';
import { PRContainer, PRItem, PRSubItem } from "renderer/components/AircraftSection/styles";

const QAPage = () => {
    const [pulls, setPulls] = useState<PullInfo[]>([]);

    const RefreshPulls = () => {
        GitVersions.getPulls('flybywiresim', 'a32nx')
            .then(r => setPulls(r));
    };

    return (
        <PRContainer onClick={() => RefreshPulls() }>
            {pulls.map(pull =>
                <PRItem>
                    <PRSubItem>{pull.number}</PRSubItem>
                    <PRSubItem>{pull.title}</PRSubItem>
                    <PRSubItem>{pull.author}</PRSubItem>
                </PRItem>
            )}
        </PRContainer>
    );
};

export default QAPage;
