import settings from 'renderer/rendererSettings';

export enum Simulators {
  Msfs2020 = 'msfs2020',
  Msfs2024 = 'msfs2024',
}

export const enabledSimulators = () => {
  return Object.values(Simulators).filter(
    (sim) => (settings.get('mainSettings.simulator') as Record<Simulators, { enabled: boolean }>)[sim]?.enabled,
  );
};

export const nextSim = (sim: Simulators) => {
  const values = Object.values(enabledSimulators());
  const currentIndex = values.indexOf(sim);
  const nextIndex = (currentIndex + 1) % values.length;
  return values[nextIndex];
};
