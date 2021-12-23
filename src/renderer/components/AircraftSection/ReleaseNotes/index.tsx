import React, { forwardRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { store, useAppSelector } from "renderer/redux/store";
import "./index.css";
import { Addon } from "renderer/utils/InstallerConfiguration";
import { useInView } from "react-intersection-observer";
import { ReleaseData } from "renderer/redux/types";
import { GitVersions } from "@flybywiresim/api-client";
import { addReleases } from "renderer/redux/features/releaseNotes";

interface ReleaseNoteCardProps {
    release: ReleaseData;
    isLatest?: boolean;
}

const ReleaseNoteCard = forwardRef<HTMLDivElement, ReleaseNoteCardProps>(({ release, isLatest }, ref) => {
    return (
        <div ref={ref} className="rounded-md bg-navy p-7">
            <div className="flex flex-row items-center mb-3.5 gap-x-4">
                <h1 className="text-white text-4xl font-semibold mb-0">{release.name}</h1>
                {isLatest && (
                    <div className="text-white border border-cyan bg-teal-medium rounded-md px-6">
                        Latest
                    </div>
                )}
            </div>
            <ReactMarkdown
                className="markdown-body"
                children={release.body ?? ''}
                remarkPlugins={[remarkGfm]}
                linkTarget={"_blank"}
            />
        </div>
    );
});

export const ReleaseNotes = ({ addon }: {addon: Addon}) => {
    const { ref, inView } = useInView({
        threshold: 0,
    });

    const releaseNotes = useAppSelector(state => state.releaseNotes[addon.key]);
    const [releaseComponent, setReleaseComponent] = useState<JSX.Element>(undefined);

    useEffect(() => {
        setReleaseComponent(
            <div className="flex flex-col gap-y-7">
                {releaseNotes.map((release, index) =>
                    <ReleaseNoteCard ref={releaseNotes.length - 1 === index ? ref : undefined} release={release} />
                )}
            </div>
        );
    }, [releaseNotes]);

    useEffect(() => {
        if (inView) {
            if (addon.repoOwner && addon.repoName) {
                GitVersions.getReleases(addon.repoOwner, addon.repoName, false, releaseNotes.length, 5).then(res => {
                    const content = res.map(release => ({
                        name: release.name,
                        publishedAt: release.publishedAt.getTime(),
                        htmlUrl: release.htmlUrl,
                        body: release.body,
                    }));

                    if (content.length) {
                        store.dispatch(addReleases({ key: addon.key, releases: content }));
                    }
                });
            } else {
                store.dispatch(addReleases({ key: addon.key, releases: [] }));
            }
        }
    }, [inView]);

    const DummyComponent = () => (
        <div className="flex flex-col gap-y-7">
            {[...Array(10)].map(index => (
                <div className="rounded-md bg-navy p-7 animate-pulse" key={index}>
                    <h3 className="bg-navy-light h-8 w-32"/>
                    <div className="h-64 w-full bg-navy-light"/>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full p-7 overflow-y-scroll">
            <div className="flex flex-row items-center justify-between">
                <h2 className="text-white font-extrabold">
                    Release Notes
                </h2>
                {/*    Dropdown will go here*/}
            </div>
            {releaseComponent ?? <DummyComponent/>}
        </div>
    );
};
