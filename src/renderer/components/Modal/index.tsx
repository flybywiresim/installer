import settings, { useSetting } from 'common/settings';
import React, { createContext, FC, useContext, useState } from 'react';
import { Dot, X } from 'react-bootstrap-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./index.css";
// @ts-ignore
import changelog from './../../../../.github/CHANGELOG.yaml';
import * as packageInfo from '../../../../package.json';
import { Button, ButtonType } from "renderer/components/Button";

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
    confirmColor?: ButtonType;
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
    dontShowAgainSettingName,
}) => {

    const [dontShowAgain, setDontShowAgain] = useSetting<boolean>(dontShowAgainSettingName ?? '');
    const [checkMark, setCheckMark] = useState<boolean>(dontShowAgain);

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
        <div className="modal">
            <h2 className="modal-title">{title}</h2>
            <ReactMarkdown
                className="mt-6 markdown-body-modal"
                children={bodyText}
                remarkPlugins={[remarkGfm]}
                linkTarget={"_blank"}
            />

            {dontShowAgainSettingName && (
                <div className="w-auto gap-x-4 mt-8">
                    <input
                        type="checkbox"
                        checked={checkMark}
                        onChange={() => setCheckMark(!checkMark)}
                        className=" w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
                    />

                    <span className="ml-2 text-2xl">Don't show me this again</span>
                </div>
            )}

            <div className="flex flex-row mt-8 gap-x-4">
                <Button className="flex-grow" onClick={handleCancel}>
                    {cancelText ?? 'Cancel'}
                </Button>
                <Button className="flex-grow" type={confirmColor} onClick={handleConfirm}>
                    {confirmText ?? 'Confirm'}
                </Button>
            </div>
        </div>
    );
};

export const AlertModal: FC<AlertModalProps> = ({
    title,
    bodyText,
    onAcknowledge,
    acknowledgeText,
    dontShowAgainSettingName,
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
            <h1 className="leading-none font-bold">{title}</h1>
            <ReactMarkdown
                className="mt-6 markdown-body-modal"
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
                className="py-3 px-8 mt-8 text-xl text-center rounded-md bg-theme-highlight text-theme-body"
                onClick={handleAcknowledge}
            >
                {acknowledgeText ?? 'Okay'}
            </div>
        </div>
    );
};

export const ChangelogModal: React.FC = () => {
    interface ChangelogType {
        releases: Release[];
    }
    interface Release {
        name: string;
        changes: Change[];
    }
    interface Change {
        title: string;
        categories: string[];
        authors: string[];
    }
    const { popModal } = useModals();

    const handleClose = () => {
        popModal();
    };

    return (
        <div className="p-8 w-5/12 max-w-screen-sm rounded-xl border-2 bg-navy border-navy-light text-quasi-white">
            <div className="flex flex-row w-full justify-between items-start">
                <h2 className="leading-none font-bold text-quasi-white">{'Changelog'}</h2>
                <div
                    className=""
                    onClick={handleClose}
                >
                    <X className="text-red-600 hover:text-red-500 -my-14.06px -mx-14.06px" size={50} strokeWidth={1} />
                </div>
            </div>
            <div className="mt-4 h-96 overflow-y-scroll">
                {(changelog as ChangelogType).releases.map((release) => <div className="mb-6">
                    <div className="text-4xl font-bold mb-2">{release.name}</div>
                    {release.changes.map((change) => <div className="mb-4 flex">
                        <div className="w-7">
                            <Dot className="" size={20} strokeWidth={1}/>
                        </div>
                        <div className="flex-1">
                            <div className="inline-block">
                                {change.title}
                                {change.categories ? change.categories.map((category) =>
                                    <div className="bg-navy-light border border-cyan rounded-md px-1 py-0 w-auto text-center inline-block ml-2 leading-tight">
                                        {category}
                                    </div>) : <></>}
                            </div>
                            <div className="flex flex-row justify-start mt-1">
                                {change.authors ? change.authors.map((author, index) =>
                                    <div>
                                        {index == 0 ? 'by ' + author : ', ' + author}
                                    </div>) : <></>}
                            </div>
                        </div>
                    </div>)}
                </div>)}
            </div>
        </div>
    );
};

export const ModalContainer: FC = () => {

    const onVersionChanged = () => {
        const { showModal } = useModals();

        if (packageInfo.version !== settings.get<string>('metaInfo.lastVersion')) {
            settings.set('metaInfo.lastVersion', packageInfo.version);
            showModal(<ChangelogModal/>);
        }
    };
    onVersionChanged();
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
