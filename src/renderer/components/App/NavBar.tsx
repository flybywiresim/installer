import React from 'react';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useIsDarkTheme, useSetting } from 'renderer/rendererSettings';
import { Publisher } from 'renderer/utils/InstallerConfiguration';
import { useAppSelector } from 'renderer/redux/store';
import { Gear, Wrench, ArrowRepeat } from 'react-bootstrap-icons';
import Msfs2020logo from '../../assets/msfs2020.png';
import Msfs2024logo from '../../assets/msfs2024.png';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';
import { Simulators } from 'renderer/utils/SimManager';

export const NavBar: FC = ({ children }) => {
  const darkTheme = useIsDarkTheme();
  const [managedSim, setManagedSim] = useSetting<Simulators>('cache.main.managedSim');
  const rotateManagedSim = () => {
    const values = Object.values(Simulators);
    const currentIndex = values.indexOf(managedSim);
    const nextIndex = (currentIndex + 1) % values.length;
    setManagedSim(values[nextIndex]);
    return;
  };

  const bg = darkTheme ? 'bg-navy-dark' : 'bg-navy';

  return (
    <div className={`${bg} flex h-full flex-col justify-between border-r border-navy-light px-6 py-7`}>
      <div className="mb-5 border-b-2 border-navy-light pb-5">
        <ManagedSimSelector to="/" className="border-none" handleClick={rotateManagedSim}>
          {managedSim === 'msfs2020' && <img width={36} src={Msfs2020logo} alt={`MSFS 2020 Logo`} />}
          {managedSim === 'msfs2024' && <img width={36} src={Msfs2024logo} alt={`MSFS 2024 Logo`} />}
        </ManagedSimSelector>
      </div>
      <div className="flex flex-col gap-y-5">{children}</div>

      <div className="mt-auto flex flex-col gap-y-5">
        {import.meta.env.DEV && (
          <NavbarItem to="/debug" className="border-none">
            <Wrench className="text-gray-100" size={28} strokeWidth={1} />
          </NavbarItem>
        )}
        <NavbarItem to="/settings" className="border-none">
          <Gear className="text-gray-100" size={28} strokeWidth={1} />
        </NavbarItem>
      </div>
    </div>
  );
};

const BASE_STYLE =
  'w-20 h-20 flex flex-col justify-center items-center rounded-md bg-transparent hover:bg-navy-light transition duration-200 border-2 border-navy-light';

export interface NavBarItemProps {
  to: string;
  showNotification?: boolean;
  notificationColor?: string;
  className?: string;
  handleClick?: () => void;
}

export const NavbarItem: FC<NavBarItemProps> = ({
  to = '/',
  showNotification = false,
  notificationColor = 'orange',
  className,
  children,
}) => (
  <NavLink to={to} className={`${BASE_STYLE} ${className}`} activeClassName={`${BASE_STYLE} bg-navy-light`}>
    {children}

    <span className="absolute size-0" style={{ visibility: showNotification ? 'visible' : 'hidden' }}>
      <svg className="relative w-4" viewBox="0 0 10 10" style={{ left: '19px', bottom: '30px' }}>
        <circle cx={5} cy={5} r={5} fill={notificationColor} />
      </svg>
    </span>
  </NavLink>
);

export const ManagedSimSelector: FC<NavBarItemProps> = ({
  to = '/',
  showNotification = false,
  notificationColor = 'orange',
  className,
  children,
  handleClick,
}) => (
  <NavLink
    to={to}
    className={`${BASE_STYLE} ${className} group`}
    activeClassName={`${BASE_STYLE} bg-navy-light`}
    onClick={handleClick}
  >
    {children}

    <span className="absolute size-0" style={{ visibility: showNotification ? 'visible' : 'hidden' }}>
      <svg className="relative w-4" viewBox="0 0 10 10" style={{ left: '19px', bottom: '30px' }}>
        <circle cx={5} cy={5} r={5} fill={notificationColor} />
      </svg>
    </span>
    <span className="absolute size-0">
      <svg className="relative bottom-[-12px] right-[-12px] group-hover:bottom-[-10px] group-hover:right-[-10px] w-6 group-hover:w-8" viewBox="0 0 10 10">
        <circle className="hidden group-hover:block" cx={5} cy={5} r={5} fill={'#1f2a3c'} />
        <ArrowRepeat className="text-gray-100" size={10} strokeWidth={1} />
      </svg>
    </span>
  </NavLink>
);

export interface NavBarPublisherProps extends NavBarItemProps {
  publisher: Publisher;
}

export const NavBarPublisher: FC<NavBarPublisherProps> = ({ to, publisher }) => {
  const hasAvailableUpdates = useAppSelector((state) => {
    return publisher.addons.some((addon) => {
      const status = state.installStatus[addon.key]?.status;

      return status === InstallStatus.NeedsUpdate || status === InstallStatus.TrackSwitch;
    });
  });

  return (
    <NavbarItem to={to} showNotification={hasAvailableUpdates} notificationColor="orange">
      <img width={publisher.logoSize ?? 32} src={publisher.logoUrl} alt={`${publisher.name} Logo`} />
    </NavbarItem>
  );
};
