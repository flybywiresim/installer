import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Container, InnerContainer, Modal, Continue, Cancel, Title } from './styles';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import warning_exp_a32nx_fbw from '../../../../.github/WARNING_EXPERIMENTAL_A32NX_FBW.md';
// @ts-ignore: Disabling ts check here because this package has no @types
import warning_exp_a32nx_ap from '../../../../.github/WARNING_EXPERIMENTAL_A32NX_AP.md';
import { shell } from 'electron';

function showwarning(props: any) {
    if (props.warningmessage != '') {
        const marked = require("marked");
        let html;
        let title;
        let openReadme: () => any;
        if (props.warningmessage === 'a32nx-fbw') {
            title = 'CAUTION';
            html = marked(warning_exp_a32nx_fbw);
            openReadme = () => shell.openExternal("https://github.com/flybywiresim/a32nx/blob/fbw/docs/README.md");
        } else if (props.warningmessage === 'a32nx-ap') {
            title = 'CAUTION';
            html = marked(warning_exp_a32nx_ap);
            openReadme = () => shell.openExternal("https://github.com/flybywiresim/a32nx/blob/autopilot/docs/README.md");
        } else {
            console.log(props.warningmessage);
            return (<></>);
        }
        return (
            <Container>
                <Modal >
                    <Title>{title}</Title>
                    <Continue onClick={() => {
                        hidewarning(); try {
                            if (props.warningmessage === 'a32nx-fbw' || props.warningmessage === 'a32nx-ap') {
                                props.props.onSelected(props.props.track);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }}>Select version</Continue>
                    <Cancel onClick={() => {
                        hidewarning();
                    }}>Cancel</Cancel>
                    <InnerContainer>
                        <div className='text'> { ReactHtmlParser (html) } <div className='button' onClick={openReadme}>Readme</div></div>
                    </InnerContainer>
                </Modal>
            </Container>
        );
    } else {
        return (<></>);
    }

}

function hidewarning() {
    const warningmessage = '';
    store.dispatch({ type: 'WARNING', payload: {
        warningmessage
    } });
}

function mapStateToProps(state: any) {
    return {
        ...state.warning,
    };
}

export default connect(mapStateToProps)(showwarning);
