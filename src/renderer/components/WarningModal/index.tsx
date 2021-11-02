import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import { WarningModalBase } from "./styles";
import { ExperimentalAddonTrack } from "renderer/utils/InstallerConfiguration";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import settings from "common/settings";

type WarningModalProps = {
    track: ExperimentalAddonTrack,
    trackHandler: CallableFunction,
    showWarningModal: boolean
};

const WarningModal = (props: WarningModalProps) => {
    const dispatch = useDispatch();

    const [disableWarningCheck, setDisableWarningCheck] = useState<boolean>(settings.get<string, boolean>('mainSettings.disableExperimentalWarning') as boolean);
    const [disableWarning, setDisableWarning] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);

    const handleDisableWarning = () => {
        setDisableWarning(disableWarningCheck);
        settings.set('mainSettings.disableExperimentalWarning', disableWarningCheck);
    };

    const handleTrackSelected = () => {
        dispatch(callWarningModal(false, props.track, true, props.trackHandler));
    };

    const handleOk = () => {
        handleDisableWarning();
        handleTrackSelected();
    };

    const handleCancel = () => {
        setDisableWarningCheck(disableWarning);
        dispatch(callWarningModal(false, null));
    };

    const handleOnChange = () => {
        console.log("Click!");
        console.log(disableWarningCheck);
        const newState = !disableWarningCheck;
        console.log(newState);
        setDisableWarningCheck(newState);
    };

    const handleVisible = (): boolean => {
        const disableWarningSettings = settings.get('mainSettings.disableExperimentalWarning') as boolean;

        if (disableWarningSettings !== disableWarning) {
            setDisableWarning(disableWarningSettings);
            setDisableWarningCheck(disableWarningSettings);
        }

        if (!disableWarning) {
            return props.showWarningModal;
        } else {
            handleTrackSelected();
            return false;
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
                    checked={disableWarningCheck}
                    onChange={handleOnChange}
                    className="ml-auto mr-2 w-4 h-4 rounded-sm checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">Don't show me this again</span>
            </div>
        </WarningModalBase>
    );
};

export default connect((state: { warningModal: WarningModalProps }) => ({ ...state.warningModal, }))(WarningModal);
