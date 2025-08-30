import { useMemo } from 'react';
import * as fs from 'fs';
import settings from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { Simulators, TypeOfSimulator } from 'renderer/utils/SimManager';

export const useErrors = () => {
  const hasBasePathError = (sim: TypeOfSimulator) =>
    settings.get(`mainSettings.simulator.${sim}.enabled`) &&
    ((!fs.existsSync(Directories.simulatorBasePath(sim)) && Directories.simulatorBasePath(sim) !== 'notInstalled') ||
      Directories.simulatorBasePath(sim) === null);

  const hasInstallError = (sim: TypeOfSimulator) =>
    settings.get(`mainSettings.simulator.${sim}.enabled`) &&
    (!fs.existsSync(Directories.installLocation(sim)) ||
      Directories.installLocation(sim) === null ||
      !fs.existsSync(Directories.communityLocation(sim)));

  return useMemo(() => {
    const noSimInstalled =
      !settings.get(`mainSettings.simulator.${Simulators.Msfs2020}.enabled`) &&
      !settings.get(`mainSettings.simulator.${Simulators.Msfs2024}.enabled`);

    const msfs2020BasePathError = hasBasePathError(Simulators.Msfs2020);
    const msfs2024BasePathError = hasBasePathError(Simulators.Msfs2024);

    const msfs2020InstallError = hasInstallError(Simulators.Msfs2020);
    const msfs2024InstallError = hasInstallError(Simulators.Msfs2024);

    const tempLocationError = !fs.existsSync(settings.get('mainSettings.tempLocation'));

    return {
      noSimInstalled,
      msfs2020BasePathError,
      msfs2024BasePathError,
      msfs2020InstallError,
      msfs2024InstallError,
      tempLocationError,
    };
  }, []);
};
