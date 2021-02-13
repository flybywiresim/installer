import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import { WarningModalBase } from "./styles";
import { ExperimentalModTrack } from "renderer/components/App";

type WarningModalProps = { track: ExperimentalModTrack, trackHandler: CallableFunction, showWarningModal: boolean };

const WarningModal: React.FC<WarningModalProps> = (props) => {
    const dispatch = useDispatch();

    const handleTrackSelected = () => {
        dispatch(callWarningModal(false, props.track, true, props.trackHandler));
    };

    const handleCancel = () => {
        dispatch(callWarningModal(false, null));
    };

    return (
        <WarningModalBase
            title="Warning!"
            visible={props.showWarningModal}
            okText="Select"
            onOk={handleTrackSelected}
            onCancel={handleCancel}
            centered={true}
            style={{
                marginLeft: '200px',
            }}
        >
            <p>{props.track?.warningContent}</p>
        </WarningModalBase>
    );
};

export default connect((state: { warningModal: WarningModalProps }) => ({ ...state.warningModal, }))(WarningModal);
