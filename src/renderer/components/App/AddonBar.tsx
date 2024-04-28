import React, { FC, memo } from 'react';
import { Addon, Publisher, PublisherButton } from 'renderer/utils/InstallerConfiguration';
import { shell } from 'electron';
import * as BootstrapIcons from 'react-bootstrap-icons';
import { ArrowRepeat, Check2, CloudArrowDownFill, Icon } from 'react-bootstrap-icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAppSelector } from 'renderer/redux/store';
import { AircraftSectionURLParams } from '../AddonSection';
import { useIsDarkTheme } from 'renderer/rendererSettings';
import { Button } from 'renderer/components/Button';
import { ChevronRight } from 'tabler-icons-react';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';

export interface AddonBarProps {
  publisher: Publisher;
}

export enum UITheme {
  Light = 'light',
  Dark = 'dark',
}

export const AddonBar: FC = ({ children }) => {
  const darkTheme = useIsDarkTheme();

  const { publisherName } = useParams<AircraftSectionURLParams>();
  const publisherData = useAppSelector((state) =>
    state.configuration.publishers.find((pub) => pub.name === publisherName)
      ? state.configuration.publishers.find((pub) => pub.name === publisherName)
      : state.configuration.publishers[0],
  );

  const PublisherButtons = (buttons: PublisherButton[]) => {
    const groups: PublisherButton[][] = [];

    let currentGroup: PublisherButton[] = [];
    for (const button of buttons) {
      if (button.inline || currentGroup.length === 0) {
        currentGroup.push(button);
      } else {
        groups.push(currentGroup);
        currentGroup = [button];
      }
    }

    if (!groups.includes(currentGroup)) {
      groups.push(currentGroup);
    }

    return (
      <>
        {groups.map((group, index) => (
          <div key={index} className="flex flex-row gap-x-4">
            {group.map((button, index) => (
              <AddonBarPublisherButton button={button} key={index} />
            ))}
          </div>
        ))}
      </>
    );
  };

  const textClass = darkTheme ? 'text-quasi-white' : 'text-navy';

  return (
    <div
      className={`flex flex-col justify-between gap-y-5 ${textClass} ${darkTheme ? 'bg-navy-dark' : 'bg-quasi-white'} h-full px-6 py-7`}
    >
      <div className="flex flex-col -space-y-7">
        <h3 className={`${textClass} -mb-1 font-bold`}>{publisherData.name}</h3>
      </div>

      <div className="flex grow flex-col">{children}</div>

      <div className="mt-auto flex flex-col gap-y-4">
        {publisherData.buttons && PublisherButtons(publisherData.buttons)}
      </div>
    </div>
  );
};

export interface AddonBarItemProps {
  addon: Addon;
  enabled?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AddonBarItem: FC<AddonBarItemProps> = ({ addon, enabled, selected, className, onClick }) => {
  const installState = useAppSelector((state) => state.installStatus[addon.key]);

  const background = selected ? `bg-dodger-light text-navy-dark` : `bg-transparent text-quasi-white`;
  const border = `${selected ? 'border-dodger-light' : 'border-navy-light'} ${enabled ? 'hover:border-dodger-light' : ''}`;

  return (
    <div
      className={`flex w-full flex-col justify-between rounded-lg border-2 p-6 transition duration-200 ${border} ${background} ${!enabled && 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
      onClick={enabled ? onClick : undefined}
    >
      <span className="mb-2.5 font-manrope text-2xl font-medium text-current">{addon.aircraftName}</span>
      <div className="mt-1 flex h-10 flex-row justify-between">
        <img className="h-10 w-max" src={selected ? addon.titleImageUrl : addon.titleImageUrlSelected} />
        {installState && <AddonBarItemStatus status={installState.status} />}
      </div>
    </div>
  );
};

interface AddonBarItemStatusProps {
  status: InstallStatus;
}

const AddonBarItemStatus: FC<AddonBarItemStatusProps> = memo(({ status }: AddonBarItemStatusProps) => {
  switch (status) {
    case InstallStatus.UpToDate:
    case InstallStatus.GitInstall:
      return <Check2 size={27} />;
    case InstallStatus.InstallingDependency:
    case InstallStatus.InstallingDependencyEnding:
    case InstallStatus.DownloadPrep:
    case InstallStatus.Decompressing:
    case InstallStatus.Downloading:
    case InstallStatus.DownloadEnding:
      return <ArrowRepeat className="mt-0.5 animate-spin" size={27} />;
    case InstallStatus.NeedsUpdate:
    case InstallStatus.TrackSwitch:
      return <CloudArrowDownFill className="mt-0.5" size={27} />;
    default:
      return <></>;
  }
});

AddonBarItemStatus.displayName = 'AddonBarItemStatus';

interface AddonBarPublisherButtonProps {
  button: PublisherButton;
}

const AddonBarPublisherButton: FC<AddonBarPublisherButtonProps> = ({ button }) => {
  const history = useHistory();

  const handleClick = async () => {
    switch (button.action) {
      case 'openBrowser':
        await shell.openExternal(button.url);
        break;
      case 'internal':
        switch (button.call) {
          case 'fbw-local-api-config':
            history.push(`/addon-section/FlyByWire Simulations/configuration/fbw-local-api-config`);
        }
        break;
    }
  };

  const ButtonIcon = (BootstrapIcons as Record<string, Icon>)[button.icon] ?? 'span';

  if (!button.style || button.style === 'normal') {
    return (
      <Button className="flex w-full flex-row items-center justify-center" disabled={button.inop} onClick={handleClick}>
        <span className="relative w-0">
          {button.forceStroke ? (
            <ButtonIcon size={24} fill="none" stroke="black" strokeWidth={0.75} />
          ) : (
            <ButtonIcon size={24} />
          )}
        </span>

        {button.text}
      </Button>
    );
  } else {
    return (
      <button
        className="flex w-full flex-row items-center justify-between rounded-md border-2 border-navy-light px-5 py-6 text-4xl transition duration-200 hover:border-cyan"
        disabled={button.inop}
        onClick={handleClick}
      >
        <span className="pl-4 pt-1">{button.text}</span>

        <ChevronRight size={32} />
      </button>
    );
  }
};
