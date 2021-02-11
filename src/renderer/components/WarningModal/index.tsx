import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import { WarningModal } from "./styles";

function showWarningModal(props: any) {
    const dispatch = useDispatch();

    function hideWarningModal() {
        dispatch(callWarningModal(false, null));
    }

    function setTrackButton() {
        dispatch(callWarningModal(false, props.track, true, props.trackHandle));
    }

    return (
        <WarningModal
            title="Warning!"
            visible={props.showWarningModal}
            okText="Select"
            onOk={setTrackButton}
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

function mapStateToProps(state: any) {
    return {
        ...state.warningModal,
    };
}

export default connect(mapStateToProps)(showWarningModal);
