import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Container, InnerContainer, Modal, Close } from './styles';
// @ts-ignore: Disabling ts check here because this package has no @types
import ReactHtmlParser from 'react-html-parser';
// @ts-ignore: Disabling ts check here because this package has no @types
import warning_exp_a32nx_fbw from '../../../../.github/WARNING_EXPERIMENTAL_A32NX_FBW.md';
// @ts-ignore: Disabling ts check here because this package has no @types
import warning_exp_a32nx_ap from '../../../../.github/WARNING_EXPERIMENTAL_A32NX_AP.md';

function showwarning(props: any) {
    if (props.warningmessage != '') {
        const marked = require("marked");
        let html;
        if (props.warningmessage === 'a32nx-fbw') {
            html = marked(warning_exp_a32nx_fbw);
        } else if (props.warningmessage === 'a32nx-ap') {
            html = marked(warning_exp_a32nx_ap);
        } else {
            console.log(props.warningmessage);
            return (<></>);
        }
        return (
            <Container>
                <Modal >
                    <Close onClick={hidewarning}>Continue</Close>
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
