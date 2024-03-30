import settings, { useSetting } from 'renderer/rendererSettings';
import React, { createContext, FC, useContext, useState } from 'react';
import { Dot, X } from 'react-bootstrap-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import changelog from './../../../../.github/CHANGELOG.yaml';
import * as packageInfo from '../../../../package.json';
import { Button, ButtonType } from 'renderer/components/Button';
import { CompactYesNoOptionToggle } from './AutostartDialog';

interface ModalContextInterface {
  showModal: (modal: JSX.Element) => void;
  showModalAsync: (modal: JSX.Element) => Promise<boolean>;
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

  const showModalAsync = (modal: JSX.Element): Promise<boolean> => {
    return new Promise((resolve) => {
      setModal(
        React.cloneElement(modal, {
          onConfirm: () => {
            resolve(true);
            modal.props.onConfirm?.();
          },
          onCancel: () => {
            resolve(false);
            modal.props.onCancel?.();
          },
          onAcknowledge: () => {
            resolve(true);
            modal.props.onAcknowledge?.();
          },
        }),
      );
    });
  };

  return (
    <ModalContext.Provider value={{ modal, showModal, showModalAsync, popModal }}>{children}</ModalContext.Provider>
  );
};

interface BaseModalProps {
  title: React.ReactElement | string;
  bodyText: React.ReactElement | string;
  dontShowAgainSettingName?: string;
  closeIfDontShowAgain?: boolean;
}

interface PromptModalProps extends BaseModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  cancelText?: string;
  confirmColor?: ButtonType;
  confirmText?: string;
  confirmEnabled?: boolean;
}

export const PromptModal: FC<PromptModalProps> = ({
  onConfirm,
  onCancel,
  cancelText,
  confirmColor,
  confirmText,
  confirmEnabled = true,
  title,
  bodyText,
  dontShowAgainSettingName,
  closeIfDontShowAgain = true,
}) => {
  const [dontShowAgain, setDontShowAgain] = useSetting<boolean>(dontShowAgainSettingName ?? '', false);
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

  if (dontShowAgain && closeIfDontShowAgain) {
    handleConfirm();
  }

  return (
    <div className="modal">
      {typeof title === 'string' ? <h1 className="modal-title">{title}</h1> : title}
      {typeof bodyText === 'string' ? (
        <ReactMarkdown className="markdown-body-modal mt-6" remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
          {bodyText}
        </ReactMarkdown>
      ) : (
        bodyText
      )}

      {dontShowAgainSettingName && (
        <DoNotAskAgain checked={checkMark} toggleChecked={() => setCheckMark((old) => !old)} />
      )}

      <div className="mt-8 flex flex-row gap-x-4">
        <Button className="grow" onClick={handleCancel}>
          {cancelText ?? 'Cancel'}
        </Button>
        <Button
          className="grow"
          type={confirmColor ?? ButtonType.Emphasis}
          disabled={!confirmEnabled}
          onClick={handleConfirm}
        >
          {confirmText ?? 'Confirm'}
        </Button>
      </div>
    </div>
  );
};

interface AlertModalProps extends BaseModalProps {
  onAcknowledge?: () => void;
  acknowledgeText?: string;
  acknowledgeColor?: ButtonType;
}

export const AlertModal: FC<AlertModalProps> = ({
  title,
  bodyText,
  onAcknowledge,
  acknowledgeText,
  acknowledgeColor = ButtonType.Neutral,
  dontShowAgainSettingName,
  closeIfDontShowAgain = true,
}) => {
  const [dontShowAgain, setDontShowAgain] = useSetting<boolean>(dontShowAgainSettingName ?? '', false);
  const [checkMark, setCheckMark] = useState<boolean>(dontShowAgain);

  const { popModal } = useModals();

  const handleAcknowledge = () => {
    if (dontShowAgainSettingName) {
      setDontShowAgain(checkMark);
    }
    onAcknowledge?.();
    popModal();
  };

  if (dontShowAgain && closeIfDontShowAgain) {
    handleAcknowledge();
  }

  return (
    <div className="modal">
      {typeof title === 'string' ? <h1 className="modal-title">{title}</h1> : title}
      {typeof bodyText === 'string' ? (
        <ReactMarkdown className="markdown-body-modal mt-6" remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
          {bodyText}
        </ReactMarkdown>
      ) : (
        bodyText
      )}

      {dontShowAgainSettingName && (
        <DoNotAskAgain checked={checkMark} toggleChecked={() => setCheckMark((old) => !old)} />
      )}

      <div className="mt-8 flex flex-row gap-x-4">
        <Button className="grow" type={acknowledgeColor} onClick={handleAcknowledge}>
          {acknowledgeText ?? 'Confirm'}
        </Button>
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
    <div className="w-5/12 max-w-screen-sm rounded-xl border-2 border-navy-light bg-navy p-8 text-quasi-white">
      <div className="flex w-full flex-row items-start justify-between">
        <h2 className="font-bold leading-none text-quasi-white">{'Changelog'}</h2>
        <div className="" onClick={handleClose}>
          <X className="-m-14.06px text-red-600 hover:text-red-500" size={50} strokeWidth={1} />
        </div>
      </div>
      <div className="mt-4 h-96 overflow-y-scroll">
        {(changelog as ChangelogType).releases.map((release) => (
          <div key={release.name} className="mb-6">
            <div className="mb-2 text-4xl font-bold">{release.name}</div>
            {release.changes.map((change, index) => (
              <div key={index} className="mb-4 flex text-2xl">
                <div className="w-7">
                  <Dot className="" size={20} strokeWidth={1} />
                </div>
                <div className="flex-1">
                  <div className="inline-block">
                    {change.title}
                    {change.categories ? (
                      change.categories.map((category) => (
                        <div
                          key={category}
                          className="ml-2 inline-block w-auto rounded-md border border-cyan bg-navy-light px-1 py-0 text-center leading-tight"
                        >
                          {category}
                        </div>
                      ))
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="mt-1 flex flex-row justify-start">
                    {change.authors ? (
                      change.authors.map((author, index) => (
                        <div key={index}>{index == 0 ? 'by ' + author : ', ' + author}</div>
                      ))
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DoNotAskAgainProps {
  checked: boolean;
  toggleChecked: () => void;
}

const DoNotAskAgain: FC<DoNotAskAgainProps> = ({ checked, toggleChecked }) => (
  <div className="mt-8 w-auto gap-x-4">
    <CompactYesNoOptionToggle enabled={checked} onToggle={toggleChecked} enabledBgColor="bg-cyan">
      Don&apos;t show this again
    </CompactYesNoOptionToggle>
  </div>
);

export const ModalContainer: FC = () => {
  const { modal, showModal } = useModals();

  const onVersionChanged = () => {
    if (packageInfo.version !== settings.get<string>('metaInfo.lastVersion')) {
      settings.set('metaInfo.lastVersion', packageInfo.version);
      showModal(<ChangelogModal />);
    }
  };

  // FIXME Why is this being called every render?
  onVersionChanged();

  return (
    <div
      className={`fixed inset-0 z-50 transition duration-200 ${modal ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div className="absolute inset-0 bg-navy-dark opacity-75" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">{modal}</div>
    </div>
  );
};
