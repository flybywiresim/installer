import React from 'react';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { WarningModal } from "./styles";

function showWarningModal(props: any) {
    return (
        <WarningModal
            title="Warning!"
            visible={props.showWarningModal}
            okText="Select"
            onOk={hideWarningModal}
            onCancel={hideWarningModal}
            centered={true}
            style={{
                marginLeft: '200px',
            }}
        >
            <p>The experimental branch kinda dangerous, yo!</p>
        </WarningModal>
    );
}

function hideWarningModal() {
    const showWarningModal = false;
    store.dispatch({ type: 'SHOW_WARNING_MODAL', payload: {
        showWarningModal
    } });
}

function mapStateToProps(state: any) {
    return {
        ...state.warningModal,
    };
}

export default connect(mapStateToProps)(showWarningModal);
