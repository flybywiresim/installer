import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { InnerContainer, Close } from './styles';
import * as packageInfo from '../../../../package.json';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import changelog from '../../../../.github/CHANGELOG.md';
import * as actionTypes from '../../redux/actionTypes';
import settings from "common/settings";

type ChangelogProps = {
    showChangelog: boolean
}

const ShowChangelog = (props: ChangelogProps) => {
    didVersionChange();
    if (props.showChangelog) {
        const marked = require("marked");
        const html = marked(changelog);
        return (
            <div className="flex justify-center items-center fixed z-20 left-0 top-0 w-screen h-screen overflow-auto bg-black bg-opacity-40">
                <div className="relative w-700px h-450px bg-navy-lighter flex flex-col rounded-lg text-teal-50 p-5">
                    <Close className="absolute right-5 text-xl h-8 w-8 cursor-pointer" onClick={hideChangelog}>
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

const hideChangelog = () => {
    store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
        showChangelog: false,
    } });
};

const didVersionChange = () => {
    if (packageInfo.version !== settings.get<string>('metaInfo.lastVersion')) {
        settings.set('metaInfo.lastVersion', packageInfo.version);
        store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
            showChangelog: true
        } });
    }
};

const mapStateToProps = (state: { changelog: ChangelogProps }) => {
    return {
        ...state.changelog,
    };
};

export default connect(mapStateToProps)(ShowChangelog);
