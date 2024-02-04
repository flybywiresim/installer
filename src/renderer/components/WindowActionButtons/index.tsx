import React from 'react';
import { shell } from 'electron';
import { ipcRenderer } from 'electron';
import { WindowsControl } from 'react-windows-controls';
import channels from 'common/channels';
import { Directories } from 'renderer/utils/Directories';
import { store } from 'renderer/redux/store';
import { InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import { AlertModal, useModals } from 'renderer/components/Modal';
import { ExclamationCircle } from 'react-bootstrap-icons';

export type ButtonProps = { id?: string; className?: string; onClick?: () => void; isClose?: boolean };

export const Button: React.FC<ButtonProps> = ({ id, className, onClick, isClose, children }) => {
  return (
    <button
      className={`flex h-full w-14 flex-row items-center justify-center text-gray-200 ${isClose ? 'hover:bg-red-500' : 'hover:bg-gray-700'} ${className}`}
      onClick={onClick ?? (() => {})}
      id={id}
    >
      {children}
    </button>
  );
};

export const WindowButtons: React.FC = () => {
  const { showModal } = useModals();

  const openGithub = () => shell.openExternal('https://github.com/flybywiresim/a32nx/issues/new/choose');

  const handleMinimize = () => {
    ipcRenderer.send(channels.window.minimize);
  };

  const handleMaximize = () => {
    ipcRenderer.send(channels.window.maximize);
  };

  const handleClose = () => {
    const installStatuses = store.getState().installStatus;

    const anyInstalling = Object.values(installStatuses).some((it) =>
      InstallStatusCategories.installing.includes(it.status),
    );

    if (anyInstalling) {
      showModal(
        <AlertModal
          title="Hold on"
          bodyText="You currently have addons being installed or updated. Please finish or cancel those before closing the app."
          acknowledgeText="OK"
        />,
      );
    } else {
      Directories.removeAllTemp();
      ipcRenderer.send(channels.window.close);
    }
  };

  return (
    <div className="ml-auto flex h-12 flex-row">
      <Button onClick={openGithub}>
        <ExclamationCircle size={16} />
      </Button>
      <WindowsControl minimize whiteIcon onClick={handleMinimize} />
      <WindowsControl maximize whiteIcon onClick={handleMaximize} />
      <WindowsControl close whiteIcon onClick={handleClose} />
    </div>
  );
};
