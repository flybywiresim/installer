import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
// @ts-ignore: Disabling ts check here because this package has no @types
import { Container, Modal, Close } from './styles';
import ReactHtmlParser from 'react-html-parser';
import changelog from '../../../../.github/CHANGELOG.md';

function showchangelog(props) {
    if (props.showchangelog) {
        const marked = require("marked");
        const html = marked(changelog);
        return (
            <Container>
                <Modal >
                    <Close onClick={hidechangelog}>X</Close>
                    <div className='text'></div>
                    <div className='text'> { ReactHtmlParser (html) } </div>
                </Modal>
            </Container>
        );
    } else {
        return (<></>);
    }

}

function hidechangelog() {
    const showchangelog = false;
    store.dispatch({ type: 'CHANGELOG', payload: {
        showchangelog
    } });
}

function mapStateToProps(state) {
    return {
        ...state.changelog,
    };
}

export default connect(mapStateToProps)(showchangelog);
