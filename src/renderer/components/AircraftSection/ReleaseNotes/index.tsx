import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppSelector } from "renderer/redux/store";
import "./index.css";

export const ReleaseNotes = () => {
    const releaseNotes = useAppSelector(state => state.releaseNotes);
    const [releaseComponent, setReleaseComponent] = useState<JSX.Element>(undefined);

    useEffect(() => {
        setReleaseComponent(
            <div className="flex flex-col gap-y-7">
                {releaseNotes.map((release, index) =>
                    <div className="rounded-md bg-navy p-7" key={index}>
                        <h1 className="text-white text-4xl font-semibold">{release.name}</h1>
                        <ReactMarkdown
                            className="markdown-body"
                            children={release.body ?? ''}
                            remarkPlugins={[remarkGfm]}
                            linkTarget={"_blank"}
                        />
                    </div>
                )}
            </div>
        );
    }, []);

    const DummyComponent = () => (
        <div className="flex flex-col gap-y-7">
            {[...Array(10)].map(_ => (
                <div className="rounded-md bg-navy p-7 animate-pulse">
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
