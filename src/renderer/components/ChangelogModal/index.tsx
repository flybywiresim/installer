import React from 'react';
import { connect } from 'react-redux';
import Store from 'electron-store';
import store from '../../redux/store';
import { Container, InnerContainer, Modal, Close } from './styles';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import changelog from '../../../../.github/CHANGELOG.md';
import * as actionTypes from '../../redux/actionTypes';

type ChangelogProps = {
    showchangelog: boolean
}

const settings = new Store;

const ShowChangelog = (props: ChangelogProps) => {
    didVersionChange();
    if (props.showchangelog) {
        const marked = require("marked");
        const html = marked(changelog);
        return (
            <Container>
                <Modal >
                    <Close onClick={hideChangelog}>X</Close>
                    <InnerContainer>
                        <div className='text'> { ReactHtmlParser (html) } </div>
                    </InnerContainer>
                </Modal>
            </Container>
        );
    } else {
        return (<></>);
    }

};

const hideChangelog = () => {
    store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
        showchangelog: false,
    } });
};

const didVersionChange = () => {
    if (settings.get('metaInfo.versionChanged')) {
        settings.set('metaInfo.versionChanged', false);
        store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
            showchangelog: true
        } });
    }
};

const mapStateToProps = (state: { changelog: ChangelogProps }) => {
    return {
        ...state.changelog,
    };
};

export default connect(mapStateToProps)(ShowChangelog);
