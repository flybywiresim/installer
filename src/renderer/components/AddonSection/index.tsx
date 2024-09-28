import React, { FC, useCallback, useEffect, useState } from 'react';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import { DownloadItem } from 'renderer/redux/types';
import { useSelector } from 'react-redux';
import { InstallerStore, useAppDispatch, useAppSelector } from '../../redux/store';
import { Addon, AddonCategoryDefinition, AddonTrack } from 'renderer/utils/InstallerConfiguration';
import { NavLink, Redirect, Route, useHistory, useParams } from 'react-router-dom';
import { Gear, InfoCircle, JournalText, Sliders } from 'react-bootstrap-icons';
import settings, { useSetting } from 'renderer/rendererSettings';
import { ipcRenderer } from 'electron';
import { AddonBar, AddonBarItem } from '../App/AddonBar';
import { NoAvailableAddonsSection } from '../NoAvailableAddonsSection';
import { ReleaseNotes } from './ReleaseNotes';
import { setSelectedTrack } from 'renderer/redux/features/selectedTrack';
import { PromptModal, useModals } from 'renderer/components/Modal';
import ReactMarkdown from 'react-markdown';
import { Button, ButtonType } from 'renderer/components/Button';
import { MainActionButton } from 'renderer/components/AddonSection/MainActionButton';
import { ApplicationStatus, InstallStatus, InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import { setApplicationStatus } from 'renderer/redux/features/applicationStatus';
import { LocalApiConfigEditUI } from '../LocalApiConfigEditUI';
import { Configure } from 'renderer/components/AddonSection/Configure';
import { InstallManager } from 'renderer/utils/InstallManager';
import { StateSection } from 'renderer/components/AddonSection/StateSection';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { MyInstall } from 'renderer/components/AddonSection/MyInstall';

const abortControllers = new Array<AbortController>(20);
abortControllers.fill(new AbortController());

interface InstallButtonProps {
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SidebarButton: FC<InstallButtonProps> = ({
  type = ButtonType.Neutral,
  disabled = false,
  onClick,
  children,
}) => (
  <Button type={type} disabled={disabled} className={`w-64`} onClick={onClick}>
    {children}
  </Button>
);

interface SideBarLinkProps {
  to: string;
  disabled?: boolean;
}

const SideBarLink: FC<SideBarLinkProps> = ({ to, children, disabled = false }) => (
  <NavLink
    className={`flex w-full flex-row items-center gap-x-5 text-2xl ${disabled ? 'text-gray-500' : 'text-white'} font-manrope font-bold no-underline hover:text-cyan`}
    activeClassName="text-cyan"
    to={to}
    style={{ pointerEvents: disabled ? 'none' : 'unset' }}
  >
    {children}
  </NavLink>
);

export interface AircraftSectionURLParams {
  publisherName: string;
}

export const AddonSection = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { publisherName } = useParams<AircraftSectionURLParams>();
  const publisherData = useAppSelector((state) =>
    state.configuration.publishers.find((pub) => pub.name === publisherName)
      ? state.configuration.publishers.find((pub) => pub.name === publisherName)
      : state.configuration.publishers[0],
  );

  const [selectedAddon, setSelectedAddon] = useState<Addon>(() => {
    try {
      return publisherData.addons[0];
    } catch (e) {
      throw new Error('Invalid publisher key: ' + publisherName);
    }
  });

  const [hiddenAddon, setHiddenAddon] = useState<Addon | undefined>(undefined);

  const installedTracks = useAppSelector((state) => state.installedTracks);
  const selectedTracks = useAppSelector((state) => state.selectedTracks);
  const installStates = useAppSelector((state) => state.installStatus);
  const releaseNotes = useAppSelector((state) => state.releaseNotes[selectedAddon.key]);

  useEffect(() => {
    const hiddenAddon = publisherData.addons.find((addon) => addon.key === selectedAddon.hidesAddon);

    if (hiddenAddon) {
      setHiddenAddon(hiddenAddon);
      history.push(`/addon-section/${publisherName}/hidden-addon-cover`);
    } else {
      setHiddenAddon(undefined);
      history.push(`/addon-section/${publisherName}/main/configure/release-track`);
    }

    settings.set('cache.main.lastShownAddonKey', selectedAddon.key);
  }, [history, publisherData.addons, publisherName, selectedAddon]);

  useEffect(() => {
    const firstAvailableAddon = publisherData.addons.find((addon) => addon.enabled);

    if (!firstAvailableAddon) {
      history.push(`/addon-section/${publisherName}/no-available-addons`);
      return;
    }

    const lastSeenAddonKey = settings.get('cache.main.lastShownAddonKey');
    const addonToSelect =
      publisherData.addons.find((addon) => addon.key === lastSeenAddonKey) ||
      publisherData.addons.find((addon) => addon.key === firstAvailableAddon.key);

    setSelectedAddon(addonToSelect);
  }, [history, publisherData.addons, publisherName]);

  const installedTrack = (installedTracks[selectedAddon.key] as AddonTrack) ?? null;

  const setCurrentlySelectedTrack = useCallback(
    (newSelectedTrack: AddonTrack) => {
      dispatch(setSelectedTrack({ addonKey: selectedAddon.key, track: newSelectedTrack }));
    },
    [dispatch, selectedAddon.key],
  );

  const selectedTrack = (selectedTracks[selectedAddon.key] as AddonTrack) ?? null;

  const download: DownloadItem = useSelector((state: InstallerStore) =>
    state.downloads.find((download) => download.id === selectedAddon.key),
  );

  const isDownloading = download?.progress.totalPercent >= 0;
  const status = installStates[selectedAddon.key]?.status;
  const isInstalling = InstallStatusCategories.installing.includes(status);
  const isFinishingDependencyInstall = status === InstallStatus.InstallingDependencyEnding;

  useEffect(() => {
    const checkApplicationInterval = setInterval(async () => {
      // Map app references to definition objects
      const disallowedRunningExternalApps = ExternalApps.forAddon(selectedAddon, publisherData);

      for (const app of disallowedRunningExternalApps ?? []) {
        // Determine what state the app is in
        let state = false;
        switch (app.detectionType) {
          case 'ws':
            state = await ExternalApps.determineStateWithWS(app);
            break;
          case 'http':
            state = await ExternalApps.determineStateWithHttp(app);
            break;
          case 'tcp':
            state = await ExternalApps.determineStateWithTcp(app);
            break;
        }

        // Dispatch the app's state
        dispatch(
          setApplicationStatus({
            applicationName: app.key,
            applicationStatus: state ? ApplicationStatus.Open : ApplicationStatus.Closed,
          }),
        );
      }
    }, 500);

    return () => clearInterval(checkApplicationInterval);
  }, [dispatch, publisherData, selectedAddon]);

  useEffect(() => {
    if (!isInstalling) {
      void InstallManager.getAddonInstallState(selectedAddon);
    }
  }, [isInstalling, selectedAddon]);

  useEffect(() => {
    if (download && isDownloading) {
      ipcRenderer.send('set-window-progress-bar', download.progress.totalPercent / 100);
    } else {
      ipcRenderer.send('set-window-progress-bar', -1);
    }
  }, [download, isDownloading]);

  const [addonDiscovered] = useSetting<boolean>('cache.main.discoveredAddons.' + hiddenAddon?.key);

  useEffect(() => {
    if (addonDiscovered) {
      setSelectedAddon(hiddenAddon);
    }
  }, [addonDiscovered, hiddenAddon]);

  const { showModal, showModalAsync } = useModals();

  const handleTrackSelection = (track: AddonTrack) => {
    if (!isInstalling) {
      if (track.isExperimental) {
        showModal(
          <PromptModal
            title="Warning!"
            bodyText={track.warningContent}
            confirmColor={ButtonType.Caution}
            onConfirm={() => {
              setCurrentlySelectedTrack(track);

              // Update install state
              void InstallManager.refreshAddonInstallState(selectedAddon);
            }}
            dontShowAgainSettingName="mainSettings.disableExperimentalWarning"
          />,
        );
      } else {
        setCurrentlySelectedTrack(track);

        // Update install state
        void InstallManager.refreshAddonInstallState(selectedAddon);
      }
    }
  };

  const handleInstall = async () => {
    if (settings.has('mainSettings.installPath')) {
      await InstallManager.installAddon(selectedAddon, publisherData, showModalAsync);
    } else {
      await setupInstallPath();
    }
  };

  const handleCancel = useCallback(() => {
    if (isInstalling && !isFinishingDependencyInstall) {
      InstallManager.cancelDownload(selectedAddon);
    }
  }, [isInstalling, isFinishingDependencyInstall, selectedAddon]);

  const UninstallButton = (): JSX.Element => {
    switch (status) {
      case InstallStatus.UpToDate:
      case InstallStatus.NeedsUpdate:
      case InstallStatus.TrackSwitch:
      case InstallStatus.DownloadDone:
      case InstallStatus.GitInstall: {
        return (
          <SidebarButton
            type={ButtonType.Neutral}
            onClick={() => InstallManager.uninstallAddon(selectedAddon, publisherData, showModalAsync)}
          >
            Uninstall
          </SidebarButton>
        );
      }
      default:
        return <></>;
    }
  };

  if (!publisherData) {
    return null;
  }

  if (publisherData.addons.length === 0) {
    return <NoAvailableAddonsSection />;
  }

  return (
    <div className="flex size-full flex-row">
      <div className="z-40 h-full flex-none bg-navy-medium" style={{ width: '29rem' }}>
        <div className="flex h-full flex-col divide-y divide-gray-700">
          <AddonBar>
            <div className="flex flex-col gap-y-4">
              {publisherData.addons
                .filter((it) => !it.category)
                .map((addon) => (
                  <AddonBarItem
                    selected={selectedAddon.key === addon.key && addon.enabled}
                    enabled={addon.enabled || !!addon.hidesAddon}
                    addon={addon}
                    key={addon.key}
                    onClick={() => {
                      history.push(`/addon-section/${publisherData.name}/`);

                      setSelectedAddon(addon);
                    }}
                  />
                ))}
            </div>

            <div className="flex h-full flex-col gap-y-4">
              {publisherData.defs
                ?.filter((it) => it.kind === 'addonCategory')
                .map((category: AddonCategoryDefinition) => {
                  const categoryAddons = publisherData.addons.filter(
                    (it) => it.category?.substring(1) === category.key,
                  );

                  if (categoryAddons.length === 0) {
                    return null;
                  }

                  let classes = '';
                  if (category.styles?.includes('align-bottom')) {
                    classes += 'mt-auto';
                  }

                  return (
                    <div key={category.key} className={classes}>
                      <h4 className="font-manrope font-medium text-quasi-white">{category.title}</h4>

                      <div className="flex flex-col gap-y-4">
                        {publisherData.addons
                          .filter((it) => it.category?.substring(1) === category.key)
                          .map((addon) => (
                            <AddonBarItem
                              selected={selectedAddon.key === addon.key && addon.enabled}
                              enabled={addon.enabled || !!addon.hidesAddon}
                              addon={addon}
                              key={addon.key}
                              onClick={() => {
                                history.push(`/addon-section/${publisherData.name}/`);

                                setSelectedAddon(addon);
                              }}
                            />
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </AddonBar>
        </div>
      </div>
      <div className={`flex size-full flex-col bg-navy`}>
        <div className="relative flex h-full flex-row">
          <div className="w-full">
            <Route path={`/addon-section/FlyByWire Simulations/configuration/fbw-local-api-config`}>
              <LocalApiConfigEditUI />
            </Route>

            <Route exact path={`/addon-section/${publisherName}`}>
              {publisherData.addons.every((addon) => !addon.enabled) ? (
                <Redirect to={`/addon-section/${publisherName}/no-available-addons`} />
              ) : (
                <Redirect to={`/addon-section/${publisherName}/main/configure`} />
              )}
            </Route>

            <Route path={`/addon-section/${publisherName}/no-available-addons`}>
              <NoAvailableAddonsSection />
            </Route>

            <Route path={`/addon-section/${publisherName}/main`}>
              <div className="flex h-full flex-col">
                <div
                  className="relative shrink-0 bg-cover bg-center"
                  style={{
                    height: '44vh',
                    backgroundImage:
                      (selectedAddon.backgroundImageShadow ?? true)
                        ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url(${selectedAddon.backgroundImageUrls[0]})`
                        : `url(${selectedAddon.backgroundImageUrls[0]})`,
                  }}
                >
                  <div className="absolute bottom-0 left-0 flex w-full flex-row items-end gap-x-1 bg-navy">
                    <StateSection publisher={publisherData} addon={selectedAddon} />
                  </div>
                </div>
                <div className="flex h-0 grow flex-row">
                  <Route exact path={`/addon-section/${publisherName}/main/configure`}>
                    <Redirect to={`/addon-section/${publisherName}/main/configure/release-track`} />
                  </Route>

                  <Route
                    path={`/addon-section/:publisher/main/configure/:aspectKey`}
                    render={({
                      match: {
                        params: { aspectKey },
                      },
                    }) => (
                      <Configure
                        routeAspectKey={aspectKey}
                        selectedAddon={selectedAddon}
                        selectedTrack={selectedTrack}
                        installedTrack={installedTrack}
                        onTrackSelection={handleTrackSelection}
                      />
                    )}
                  />

                  <Route path={`/addon-section/${publisherName}/main/release-notes`}>
                    {releaseNotes && releaseNotes.length > 0 ? (
                      <ReleaseNotes addon={selectedAddon} />
                    ) : (
                      <Redirect to={`/addon-section/${publisherName}/main/configure`} />
                    )}
                  </Route>

                  <Route path={`/addon-section/${publisherName}/main/simbridge-config`}>
                    <LocalApiConfigEditUI />
                  </Route>

                  <Route path={`/addon-section/${publisherName}/main/about`}>
                    <About addon={selectedAddon} />
                  </Route>

                  <div className="relative ml-auto flex h-full shrink-0 flex-col items-center justify-between bg-navy-dark p-7">
                    <div className="flex w-full flex-col items-start space-y-7 place-self-start">
                      <SideBarLink to={`/addon-section/${publisherName}/main/configure`}>
                        <Sliders size={22} />
                        Configure
                      </SideBarLink>
                      {releaseNotes && releaseNotes.length > 0 && (
                        <SideBarLink to={`/addon-section/${publisherName}/main/release-notes`}>
                          <JournalText size={22} />
                          Release Notes
                        </SideBarLink>
                      )}
                      {selectedAddon.key === 'simbridge' && ( // TODO find a better way to do this...
                        <SideBarLink
                          to={`/addon-section/${publisherName}/main/simbridge-config`}
                          disabled={InstallStatusCategories.installing.includes(status)}
                        >
                          <Gear size={22} />
                          Settings
                        </SideBarLink>
                      )}
                      <SideBarLink to={`/addon-section/${publisherName}/main/about`}>
                        <InfoCircle size={22} />
                        About
                      </SideBarLink>
                    </div>

                    <div className="flex flex-col gap-y-4">
                      <UninstallButton />
                      {installStates[selectedAddon.key] && (
                        <MainActionButton
                          installState={installStates[selectedAddon.key]}
                          onInstall={handleInstall}
                          onCancel={handleCancel}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Route>
          </div>
        </div>
      </div>
    </div>
  );
};

const About: FC<{ addon: Addon }> = ({ addon }) => (
  <div className="size-full p-7">
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-white">About</h2>

      <h2 className="text-white">{addon.aircraftName}</h2>
    </div>
    <ReactMarkdown className="font-manrope text-xl font-light leading-relaxed text-white" linkTarget={'_blank'}>
      {addon.description}
    </ReactMarkdown>

    {addon.techSpecs && addon.techSpecs.length > 0 && (
      <>
        <h3 className="font-bold text-white">Tech Specs</h3>

        <div className="flex flex-row gap-x-16">
          {addon.techSpecs.map((spec) => (
            <span key={spec.name} className="flex flex-col items-start">
              <span className="mb-1 text-2xl text-quasi-white">{spec.name}</span>
              <span className="font-manrope text-4xl font-semibold text-cyan">{spec.value}</span>
            </span>
          ))}
        </div>
      </>
    )}

    <MyInstall addon={addon} />
  </div>
);
