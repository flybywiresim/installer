import React, { createContext, FC, useContext, useState } from 'react';

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
}) => {

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
        onConfirm?.();
        popModal();
    };

    const handleCancel = () => {
        onCancel?.();
        popModal();
    };

    return (
        <div className="p-8 w-5/12 rounded-xl border-2 bg-navy border-navy-light text-quasi-white">
            <h2 className="font-bold text-quasi-white">{title}</h2>
            <p className="mt-4">{bodyText}</p>

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
}) => {
    const { popModal } = useModals();

    const handleAcknowledge = () => {
        onAcknowledge?.();
        popModal();
    };

    return (
        <div className="p-8 w-5/12 rounded-xl border-2 bg-theme-body border-theme-accent">
            <h1 className="font-bold">{title}</h1>
            <p className="mt-4">{bodyText}</p>
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
