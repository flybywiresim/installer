import { useSetting } from 'common/settings';
import React, { createContext, FC, useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./index.css";

interface ModalContextInterface{
    showModal: (modal: JSX.Element) => void;
    modal?: JSX.Element;
    popModal: () => void;
}

const ModalContext = createContext<ModalContextInterface>(undefined);

export const useModals = (): ModalContextInterface => useContext(ModalContext);

export const ModalProvider: FC = ({ children }) => {
    const [modal, setModal] = useState<JSX.Element | undefined>(undefined);

    const popModal = () => {
        setModal(undefined);
    };

    const showModal = (modal: JSX.Element) => {
        setModal(modal);
    };

    return (
        <ModalContext.Provider value={{ modal, showModal, popModal }}>
            {children}
        </ModalContext.Provider>
    );
};

interface BaseModalProps {
    title: string;
    bodyText: string;
    dontShowAgainSettingName?: string;
}

interface PromptModalProps extends BaseModalProps {
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmColor?: string;
    confirmText?: string;
    cancelText?: string;
}

interface AlertModalProps extends BaseModalProps {
    onAcknowledge?: () => void;
    acknowledgeText?: string;

}

export const PromptModal: FC<PromptModalProps> = ({
    title,
    bodyText,
    onConfirm,
    onCancel,
    confirmText,
    confirmColor,
    cancelText,
    dontShowAgainSettingName
}) => {

    const [dontShowAgain, setDontShowAgain] = useSetting<boolean>(dontShowAgainSettingName ?? '');
    const [checkMark, setCheckMark] = useState<boolean>(dontShowAgain);

    const colors = (color: string) => {
        switch (color) {
            case 'red':
                return 'bg-red-600 text-white';
            case 'cyan':
                return 'bg-cyan text-navy';
            case 'green':
            default:
                return 'bg-green-500 text-white';
        }
    };

    const { popModal } = useModals();

    const handleConfirm = () => {
        if (dontShowAgainSettingName) {
            setDontShowAgain(checkMark);
        }
        onConfirm?.();
        popModal();
    };

    const handleCancel = () => {
        onCancel?.();
        popModal();
    };

    if (dontShowAgain) {
        handleConfirm();
    }

    return (
        <div className="p-8 w-5/12 max-w-screen-sm rounded-xl border-2 bg-navy border-navy-light text-quasi-white">
            <h2 className="font-bold text-quasi-white">{title}</h2>
            <ReactMarkdown
                className="mt-4 markdown-body-modal"
                children={bodyText}
                remarkPlugins={[remarkGfm]}
                linkTarget={"_blank"}
            />

            {dontShowAgainSettingName ? <div className="w-auto space-x-4 mt-8">
                <input
                    type="checkbox"
                    checked={checkMark}
                    onChange={() => setCheckMark(!checkMark)}
                    className=" w-4 h-4 rounded-sm checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">Don't show me this again</span>
            </div> : <div></div>}

            <div className="flex flex-row mt-8 space-x-4">
                <div
                    className="py-2 px-8 w-full text-xl text-center rounded-md bg-navy-light font-bold text-quasi-white cursor-pointer hover:bg-opacity-60"
                    onClick={handleCancel}
                >
                    {cancelText ?? 'Cancel'}
                </div>
                <div
                    className={'py-2 px-8 w-full text-xl text-center rounded-md ' + colors(confirmColor) + ' font-bold  cursor-pointer hover:bg-opacity-60'}
                    onClick={handleConfirm}
                >
                    {confirmText ?? 'Confirm'}
                </div>
            </div>
        </div>
    );
};

export const AlertModal: FC<AlertModalProps> = ({
    title,
    bodyText,
    onAcknowledge,
    acknowledgeText,
    dontShowAgainSettingName
}) => {

    const [dontShowAgain, setDontShowAgain] = useSetting<boolean>(dontShowAgainSettingName ?? '');
    const [checkMark, setCheckMark] = useState<boolean>(dontShowAgain);

    const { popModal } = useModals();

    const handleAcknowledge = () => {
        if (dontShowAgainSettingName) {
            setDontShowAgain(checkMark);
        }
        onAcknowledge?.();
        popModal();
    };

    if (dontShowAgain) {
        handleAcknowledge();
    }

    return (
        <div className="p-8 w-5/12 rounded-xl border-2 bg-theme-body border-theme-accent">
            <h1 className="font-bold">{title}</h1>
            <ReactMarkdown
                className="mt-4 markdown-body-modal"
                children={bodyText}
                remarkPlugins={[remarkGfm]}
                linkTarget={"_blank"}
            />

            {dontShowAgainSettingName ? <div className="w-auto space-x-4 mt-8">
                <input
                    type="checkbox"
                    checked={checkMark}
                    onChange={() => setCheckMark(!checkMark)}
                    className=" w-4 h-4 rounded-sm checked:bg-blue-600 checked:border-transparent"
                />
                <span className="ml-2">Don't show me this again</span>
            </div> : <div></div>}

            <div
                className="py-2 px-8 mt-8 text-center rounded-md bg-theme-highlight text-theme-body"
                onClick={handleAcknowledge}
            >
                {acknowledgeText ?? 'Okay'}
            </div>
        </div>
    );
};

export const ModalContainer: FC = () => {
    const { modal } = useModals();

    return (
        <div className={`fixed inset-0 z-50 bg-opacity-70 transition duration-200 ${modal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 opacity-75 bg-navy-dark" />
            <div className="flex absolute inset-0 flex-col justify-center items-center">
                {modal}
            </div>
        </div>
    );
};
