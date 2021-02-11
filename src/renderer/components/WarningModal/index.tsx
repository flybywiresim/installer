import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { Container, InnerContainer, Modal, Close } from './styles';

function showWarningModal(props: any) {
    if (props.showWarningModal) {
        return (
            <Container>
                <Modal>
                    <Close onClick={hideWarningModal}>X</Close>
                    <InnerContainer>
                        <p>Hello there, general kenobi!</p>
                    </InnerContainer>
                </Modal>
            </Container>
        );
    } else {
        return (<></>);
    }

}

function hideWarningModal() {
    const showWarningModal = false;
    store.dispatch({ type: 'SHOW_WARNING_MODAL', payload: {
        showWarningModal
    } });
}

function mapStateToProps(state: any) {
    return {
        ...state.showWarningModal,
    };
}

export default connect(mapStateToProps)(showWarningModal);
