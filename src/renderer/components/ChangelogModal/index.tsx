import React, { FC } from 'react';
import { InnerContainer, Close } from './styles';
import * as packageInfo from '../../../../package.json';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import changelog from '../../../../.github/CHANGELOG.md';
import settings from "common/settings";
import { useAppDispatch, useAppSelector } from "renderer/redux/store";
import { callChangelog } from "renderer/redux/features/changelog";

export const ChangelogModal: FC = () => {
    const dispatch = useAppDispatch();
    const showChangelog = useAppSelector((state) => state.changelog.showChangelog);

    const handleHideChangelog = () => {
        dispatch(callChangelog({ showChangelog: false }));
    };

    didVersionChange();

    if (showChangelog) {
        const marked = require("marked");
        const html = marked(changelog);

        return (
            <div className="flex justify-center items-center fixed z-20 left-0 top-0 w-screen h-screen overflow-auto bg-black bg-opacity-40">
                <div className="relative w-700px h-450px bg-navy-lighter flex flex-col rounded-lg text-teal-50 p-5">
                    <Close className="absolute right-5 text-xl h-8 w-8 cursor-pointer" onClick={handleHideChangelog}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </Close>
                    <InnerContainer>
                        <div className='text'> { ReactHtmlParser (html) } </div>
                    </InnerContainer>
                </div>
            </div>
        );
    } else {
        return (<></>);
    }
};

const didVersionChange = () => {
    const dispatch = useAppDispatch();

    if (packageInfo.version !== settings.get<string>('metaInfo.lastVersion')) {
        settings.set('metaInfo.lastVersion', packageInfo.version);
        dispatch(callChangelog({ showChangelog: true }));
    }
};
