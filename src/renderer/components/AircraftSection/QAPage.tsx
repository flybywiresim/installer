import React, { useState } from 'react';
import { GitVersions, PullInfo } from '@flybywiresim/api-client';
import { PRContainer, PRContent, PRItem, PRSubItem } from "renderer/components/AircraftSection/styles";

const QAPage = () => {
    const [pulls, setPulls] = useState<PullInfo[]>([]);

    const RefreshPulls = () => {
        GitVersions.getPulls('flybywiresim', 'a32nx')
            .then(r => setPulls(r));
    };

    return (
        <PRContent>
            <PRContainer>
                <button type="button" className="text-white text-left" onClick={() => RefreshPulls()}>Refresh Pulls</button>
                {pulls.map(pull =>
                    <PRItem key={pull.number}>
                        <PRSubItem>{pull.number}</PRSubItem>
                        <PRSubItem>{pull.title}</PRSubItem>
                        <PRSubItem>{pull.author}</PRSubItem>
                    </PRItem>
                )}
            </PRContainer>
        </PRContent>
    );
};

export default QAPage;
