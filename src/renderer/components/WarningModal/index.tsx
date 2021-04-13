import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { callWarningModal } from "renderer/redux/actions/warningModal.actions";
import { WarningModalBase } from "./styles";
import Store from "electron-store";
import { ExperimentalModTrack } from "renderer/utils/InstallerConfiguration";
import { useTranslation } from "react-i18next";

type WarningModalProps = {
    track: ExperimentalModTrack,
    trackHandler: CallableFunction,
    showWarningModal: boolean
};

const settings = new Store();

const WarningModal = (props: WarningModalProps) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [disableWarningCheck, setDisableWarningCheck] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);
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
            title={t('WarningModal.Warning')}
            visible={handleVisible()}
            okText={t('WarningModal.Select')}
            onOk={handleOk}
            cancelText={t('WarningModal.Cancel')}
            onCancel={handleCancel}
            centered={true}
            style={{
                marginLeft: '200px',
            }}
        >
            <p>{props.track?.warningContent}</p>
            <div className="w-auto absolute pt-10 flex items-center">
                <input
                    type="checkbox"
                    checked={disableWarningCheck}
                    onChange={handleOnChange}
                    className="ml-auto mr-2 w-4 h-4 rounded-sm checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">{t('WarningModal.DoNotShowAgain')}</span>
            </div>
        </WarningModalBase>
    );
};

export default connect((state: { warningModal: WarningModalProps }) => ({ ...state.warningModal, }))(WarningModal);
