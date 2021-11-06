import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import { WarningModalBase } from "./styles";
import { ExperimentalAddonTrack } from "renderer/utils/InstallerConfiguration";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSetting } from "common/settings";

type WarningModalProps = {
    track: ExperimentalAddonTrack,
    trackHandler: CallableFunction,
    showWarningModal: boolean
};

const WarningModal = (props: WarningModalProps) => {
    const dispatch = useDispatch();

    const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
    const [disableWarning, setDisableWarning] = useSetting<boolean>('mainSettings.disableExperimentalWarning');

    const handleDisableWarning = () => {
        setDisableWarning(dontShowAgain);
    };

    const handleTrackSelected = () => {
        dispatch(callWarningModal(false, props.track, true, props.trackHandler));
    };

    const handleOk = () => {
        setDontShowAgain(false);
        handleDisableWarning();
        handleTrackSelected();
    };

    const handleCancel = () => {
        setDontShowAgain(false);
        dispatch(callWarningModal(false, null));
    };

    const handleOnChange = () => {
        setDontShowAgain(!dontShowAgain);
    };

    const handleVisible = (): boolean => {
        if (disableWarning) {
            handleTrackSelected();
            return false;
        } else {
            return props.showWarningModal;
        }
    };

    return (
        <WarningModalBase
            title="Warning!"
            visible={handleVisible()}
            okText="Select"
            onOk={handleOk}
            onCancel={handleCancel}
            centered={true}
            style={{
                marginLeft: '200px',
            }}
        >
            <ReactMarkdown
                className="text-lg text-gray-300"
                children={props.track?.warningContent}
                remarkPlugins={[remarkGfm]}
                linkTarget={"_blank"}
            />
            <div className="w-auto absolute pt-10 flex items-center">
                <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={handleOnChange}
                    className="ml-auto mr-2 w-4 h-4 rounded-sm checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">Don't show me this again</span>
            </div>
        </WarningModalBase>
    );
};

export default connect((state: { warningModal: WarningModalProps }) => ({ ...state.warningModal, }))(WarningModal);
