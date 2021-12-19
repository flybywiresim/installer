import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppSelector } from "renderer/redux/store";

export const ReleaseNotes = () => {
    const releases = useAppSelector(state => state.releaseNotes);

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
