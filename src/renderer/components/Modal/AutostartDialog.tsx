import React, { FC, useEffect, useState } from 'react';
import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import { AlertModal } from 'renderer/components/Modal/index';
import { BackgroundServices } from 'renderer/utils/BackgroundServices';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Toggle } from 'renderer/components/Toggle';

export interface AutostartDialogProps {
  app: ExternalApplicationDefinition;
  addon: Addon;
  publisher: Publisher;
  isPrompted: boolean;
  onAcknowledge?: () => void;
}

export const AutostartDialog: FC<AutostartDialogProps> = ({
  app,
  addon,
  publisher,
  isPrompted,
  onAcknowledge = () => {},
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    BackgroundServices.isAutoStartEnabled(addon).then((state) => {
      setEnabled(state);
    });

    const interval = setInterval(async () => {
      setEnabled(await BackgroundServices.isAutoStartEnabled(addon));
    }, 500);

    return () => clearInterval(interval);
  }, [addon]);

  const handleToggle = async () => {
    const isEnabled = await BackgroundServices.isAutoStartEnabled(addon);

    await BackgroundServices.setAutoStartEnabled(addon, publisher, !isEnabled);
  };

  return (
    <AlertModal
      dontShowAgainSettingName={
        isPrompted ? `mainSettings.disableBackgroundServiceAutoStartPrompt.${publisher.key}.${addon.key}` : undefined
      }
      closeIfDontShowAgain={false}
      title={'Autostart Configuration'}
      bodyText={
        <>
          <ReactMarkdown className="markdown-body-modal mb-6 mt-2" remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
            {`You can choose to automatically start **${app.prettyName}** when you log into your Windows session.`}
          </ReactMarkdown>
          <YesNoOptionToggle
            enabled={enabled}
            onToggle={handleToggle}
            disabledBgColor="bg-navy-light"
            enabledBgColor="bg-cyan"
          >
            Autostart {enabled ? 'Enabled' : 'Disabled'}
          </YesNoOptionToggle>
        </>
      }
      onAcknowledge={onAcknowledge}
      acknowledgeText="Close"
    />
  );
};

interface YesNoOptionToggleProps {
  enabled: boolean;
  onToggle: () => void;
  enabledBgColor?: string;
  disabledBgColor?: string;
}

export const YesNoOptionToggle: FC<YesNoOptionToggleProps> = ({
  enabled,
  onToggle,
  enabledBgColor = 'bg-utility-green',
  disabledBgColor = 'bg-navy-light',
  children,
}) => {
  const handleClick = onToggle;

  const bgColor = enabled ? enabledBgColor : disabledBgColor;
  const titleColor = enabled ? 'text-navy' : 'text-quasi-white';

  return (
    <div
      className={`flex items-center gap-x-10 ${bgColor} transition-color cursor-pointer rounded-md px-10 py-12 duration-200`}
      onClick={handleClick}
    >
      <Toggle value={enabled} onToggle={handleClick} scale={1.5} bgColor="bg-navy" onColor={enabledBgColor} />

      <span className="flex gap-x-20">
        <span className={`font-manrope text-4xl font-bold ${titleColor}`}>{children}</span>
      </span>
    </div>
  );
};

export const CompactYesNoOptionToggle: FC<YesNoOptionToggleProps> = ({
  enabled,
  onToggle,
  enabledBgColor = 'bg-utility-green',
  children,
}) => {
  const handleClick = onToggle;

  const borderColor = enabled ? 'border-cyan' : 'border-navy-light';
  const titleColor = enabled ? 'text-cyan' : 'text-quasi-white';

  return (
    <div
      className={`flex items-center gap-x-6 border-2 ${borderColor} transition-color cursor-pointer rounded-md px-6 py-5 duration-200`}
      onClick={handleClick}
    >
      <Toggle value={enabled} onToggle={handleClick} scale={1.2} onColor={enabledBgColor} />

      <span className="flex gap-x-20">
        <span className={`font-manrope text-3xl font-bold ${titleColor}`}>{children}</span>
      </span>
    </div>
  );
};
