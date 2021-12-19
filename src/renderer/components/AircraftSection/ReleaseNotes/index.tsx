import React, { FC, useEffect, useState } from 'react';
import { ReleaseInfo, GitVersions } from '@flybywiresim/api-client';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ReleaseNotes: FC<{addon: Addon}> = ({ addon }) => {
    const [releases, setReleases] = useState<ReleaseInfo[]>([]);

    useEffect(() => {
        GitVersions.getReleases(addon.repoOwner, addon.repoName).then(res => setReleases((res)));
    }, []);

    console.log(releases);

    return (
        <div className="w-full h-full p-7 overflow-y-scroll">
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-white font-extrabold">
                    Release Notes
                </h2>
                {/*    Dropdown will go here*/}
            </div>
            <div className="flex flex-col gap-y-7">
                {releases.map((release, index) =>
                    <div className="rounded-md bg-navy p-7" key={index}>
                        <h3 className="text-white font-semibold">{release.name}</h3>
                        <ReactMarkdown
                            className="text-lg text-gray-300"
                            children={release.body ?? ''}
                            remarkPlugins={[remarkGfm]}
                            linkTarget={"_blank"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
