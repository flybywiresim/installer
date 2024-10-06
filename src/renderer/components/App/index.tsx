import { hot } from 'react-hot-loader';
import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from 'renderer/components/Logo';
import { SettingsSection } from 'renderer/components/SettingsSection';
import { DebugSection } from 'renderer/components/DebugSection';
import { InstallerUpdate } from 'renderer/components/InstallerUpdate';
import { WindowButtons } from 'renderer/components/WindowActionButtons';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import { ErrorModal } from '../ErrorModal';
import { NavBar, NavBarPublisher } from 'renderer/components/App/NavBar';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useAppSelector } from 'renderer/redux/store';
import settings from 'renderer/rendererSettings';
import './index.css';
import { ipcRenderer } from 'electron';
import channels from 'common/channels';
import { ModalContainer } from '../Modal';
import { PublisherSection } from 'renderer/components/PublisherSection';
import * as packageInfo from '../../../../package.json';
import { InstallManager } from 'renderer/utils/InstallManager';

const App = () => {
  const history = useHistory();
  const location = useLocation();

  const configuration = useAppSelector((state) => state.configuration);

  const [addons] = useState<Addon[]>(
    configuration.publishers.reduce((arr, curr) => {
      arr.push(...curr.addons);
      return arr;
    }, []),
  );

  useEffect(() => {
    for (const addon of addons) {
      void InstallManager.refreshAddonInstallState(addon).then(() => void InstallManager.checkForUpdates(addon));
    }

    if (settings.get('cache.main.lastShownSection')) {
      history.push(settings.get('cache.main.lastShownSection'));
    }

    // Let's listen for a route change and set the last shown section to the incoming route pathname
    history.listen((location) => {
      settings.set('cache.main.lastShownSection', location.pathname);
    });
  }, [addons, history]);

  useEffect(() => {
    const updateCheck = setInterval(
      () => {
        ipcRenderer.send(channels.checkForInstallerUpdate);

        for (const addon of addons) {
          void InstallManager.checkForUpdates(addon);
        }
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(updateCheck);
  }, [addons]);

  const configUrl = settings.get('mainSettings.configDownloadUrl') as string;

  const isDevelopmentConfigURL = () => {
    const productionURL = packageInfo.configUrls.production;
    // Protection against accidental screenshots of confidential config urls
    // Limited to flybywire config url to prevent 3rd party urls to be hidden
    let showDevURL = 'n/a';
    if (!configUrl.includes(packageInfo.configUrls.confidentialBaseUrl)) {
      showDevURL = configUrl;
    }
    return (
      configUrl !== productionURL && (
        <div className="my-auto ml-32 flex gap-x-4 text-2xl text-gray-400">
          <pre className="text-utility-amber">Developer Configuration Used: </pre>
          <pre className="text-quasi-white">{showDevURL}</pre>
        </div>
      )
    );
  };

  return (
    <>
      <ErrorModal />

      <ModalContainer />

      <SimpleBar>
        <div className="flex h-screen w-full flex-col">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="draggable absolute z-50 flex h-12 w-full flex-row items-center bg-black pl-4">
              <div className="flex h-full flex-1 flex-row items-stretch overflow-hidden">
                <Logo />

                {import.meta.env.DEV && (
                  <div className="my-auto ml-32 flex gap-x-4 text-2xl text-gray-400">
                    <pre>{packageInfo.version}</pre>
                    <pre className="text-gray-500">|</pre>
                    <pre className="text-utility-amber">Development mode</pre>
                    <pre className="text-gray-500">|</pre>
                    <pre className="text-quasi-white">{location.pathname}</pre>
                  </div>
                )}
                {isDevelopmentConfigURL()}
              </div>

              <div className="not-draggable flex h-full flex-row">
                <InstallerUpdate />
                <WindowButtons />
              </div>
            </div>

            <div className="flex h-full flex-row justify-start pt-10">
              <div className="z-40 h-full">
                <NavBar>
                  {configuration.publishers.map((publisher) => (
                    <NavBarPublisher
                      key={publisher.key}
                      to={`/addon-section/${publisher.name}`}
                      publisher={publisher}
                    />
                  ))}
                </NavBar>
              </div>

              <div className="m-0 flex w-full bg-navy">
                <Switch>
                  <Route exact path="/">
                    <Redirect to={`/addon-section/${configuration.publishers[0].name}`} />
                  </Route>
                  <Route path="/addon-section/:publisherName">
                    <PublisherSection />
                  </Route>
                  <Route exact path="/debug">
                    <DebugSection />
                  </Route>
                  <Route path="/settings">
                    <SettingsSection />
                  </Route>
                  <Route path="*">
                    <Redirect to={'/'} />
                  </Route>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </>
  );
};

export default hot(module)(App);
