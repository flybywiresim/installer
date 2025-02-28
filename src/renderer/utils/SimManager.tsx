import settings from 'renderer/rendererSettings';

export enum Simulators {
  Msfs2020 = 'msfs2020',
  Msfs2024 = 'msfs2024',
}

export const enabledSimulators = () => {
  return Object.values(Simulators).filter((sim) => settings.get('mainSettings.simulator')[sim]?.enabled);
};
