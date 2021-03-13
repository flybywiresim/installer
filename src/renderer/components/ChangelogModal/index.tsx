import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Container, InnerContainer, Modal, Close } from './styles';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import changelog from '../../../../.github/CHANGELOG.md';

type ChangelogProps = {
    showchangelog: boolean
}
function showchangelog(props: ChangelogProps) {
    if (props.showchangelog) {
        const marked = require("marked");
        const html = marked(changelog);
        return (
            <Container>
                <Modal >
                    <Close onClick={hidechangelog}>X</Close>
                    <InnerContainer>
                        <div className='text'> { ReactHtmlParser (html) } </div>
                    </InnerContainer>
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

function mapStateToProps(state: any) {
    return {
        ...state.changelog,
    };
}

export default connect(mapStateToProps)(showchangelog);
