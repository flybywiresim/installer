import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { WarningModalBase } from "./styles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSetting } from "common/settings";
import { callWarningModal } from "renderer/redux/features/warningModal";
import { useAppSelector } from "renderer/redux/store";
import { ExperimentalAddonTrack } from "renderer/utils/InstallerConfiguration";
import { setSelectedTrack } from "renderer/redux/features/selectedTrack";

export const WarningModal = (): JSX.Element => {
    const dispatch = useDispatch();

    const track = useAppSelector(state => state.warningModal.track);
    const selectedAddon = useAppSelector(state => state.warningModal.selectedAddon);

    const showWarningModal = useAppSelector(state => state.warningModal.showWarningModal);

    const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
    const [disableWarning, setDisableWarning] = useSetting<boolean>('mainSettings.disableExperimentalWarning');

    let warningContent;

    try {
        warningContent = (track as ExperimentalAddonTrack).warningContent;
    } catch (_) {
        return null;
    }

    const handleDisableWarning = () => {
        setDisableWarning(dontShowAgain);
    };

    const handleTrackSelected = () => {
        dispatch(callWarningModal({ showWarningModal: false, track: null, selectedAddon: null }));
        dispatch(setSelectedTrack({ addonKey: selectedAddon.key, track: selectedAddon.tracks.find((x) => x.key === track.key) }));
    };

    const handleOk = () => {
        setDontShowAgain(false);
        handleDisableWarning();
        handleTrackSelected();
    };

    const handleCancel = () => {
        setDontShowAgain(false);
        dispatch(callWarningModal({ showWarningModal: false, track: null, selectedAddon: null }));
    };

    const handleOnChange = () => {
        setDontShowAgain(!dontShowAgain);
    };

    const handleVisible = (): boolean => {
        if (disableWarning) {
            handleTrackSelected();
            return false;
        } else {
            return showWarningModal;
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
                children={warningContent}
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
