import React, { FC, useMemo } from 'react';
import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import { PromptModal } from 'renderer/components/Modal/index';
import { Window } from 'react-bootstrap-icons';
import { useAddonExternalApps } from 'renderer/utils/ExternalAppsUI';
import { BackgroundServices } from 'renderer/utils/BackgroundServices';
import { Resolver } from 'renderer/utils/Resolver';
import { Button } from 'renderer/components/Button';

export interface CannotInstallDialogProps {
  addon: Addon;
  publisher: Publisher;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const CannotInstallDialog: FC<CannotInstallDialogProps> = ({ addon, publisher, onCancel, onConfirm }) => {
  const [runningExternalApps, disallowedRunningExternalApps] = useAddonExternalApps(addon, publisher);

  return (
    <PromptModal
      title="Wait a minute"
      bodyText={
        <>
          <p>
            You cannot install or update <b>{addon.name}</b> while the following external apps are running:
          </p>

          <div>
            {disallowedRunningExternalApps.map((app) => (
              <RunningExternalAppEntry
                key={app.key}
                addon={addon}
                publisher={publisher}
                app={app}
                runningExternalApps={runningExternalApps}
              />
            ))}
          </div>

          <p>Close all apps above to continue.</p>

          <hr />
        </>
      }
      onCancel={onCancel}
      confirmText="Continue"
      confirmEnabled={runningExternalApps.length === 0}
      onConfirm={onConfirm}
    />
  );
};

interface RunningExternalAppEntryProps {
  addon: Addon;
  publisher: Publisher;
  app: ExternalApplicationDefinition;
  runningExternalApps: ExternalApplicationDefinition[];
}

const RunningExternalAppEntry: FC<RunningExternalAppEntryProps> = ({ addon, publisher, app, runningExternalApps }) => {
  const appIsRunning = runningExternalApps.includes(app);

  const canAppBeStopped = useMemo(() => {
    if (addon.backgroundService) {
      const def = Resolver.findDefinition(addon.backgroundService.runCheckExternalAppRef, publisher);

      if (def.kind !== 'externalApp') {
        return;
      }

      return def.key === app.key;
    }
  }, [addon.backgroundService, app.key, publisher]);

  const handleStop = () => BackgroundServices.kill(addon, publisher);

  const borderColor = appIsRunning ? 'border-utility-amber' : 'border-utility-green';
  const textColor = appIsRunning ? 'text-utility-amber' : 'text-utility-green';

  return (
    <div
      key={app.key}
      className={`flex items-center gap-x-7 border-t-4 bg-navy ${borderColor} my-6 rounded-md px-7 py-6`}
    >
      <Window size={24} className={`${textColor} fill-current`} />

      <div className="flex w-full items-center justify-between">
        <span className="flex flex-col gap-y-2">
          {/*<span className="text-3xl font-medium">{publisher.name}</span> /!* TODO when we support external apps in the global scope or other publishers, change this *!/*/}
          <span className="text-4xl font-medium">{app.prettyName}</span>
        </span>

        <span className={`flex items-center justify-between gap-x-5 ${textColor}`}>
          {canAppBeStopped ? (
            <Button className="h-14 px-12 py-1" onClick={handleStop} disabled={!appIsRunning}>
              {appIsRunning ? 'Stop' : 'Stopped'}
            </Button>
          ) : (
            <span className="text-3xl font-bold">{appIsRunning ? 'Running' : 'Closed'}</span>
          )}
        </span>
      </div>
    </div>
  );
};
