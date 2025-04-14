import React from 'react';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useIsDarkTheme } from 'renderer/rendererSettings';
import { Publisher } from 'renderer/utils/InstallerConfiguration';
import { useAppSelector } from 'renderer/redux/store';
import { Gear, Wrench } from 'react-bootstrap-icons';
import { InstallStatus } from 'renderer/components/AddonSection/Enums';

export const NavBar: FC = ({ children }) => {
  const darkTheme = useIsDarkTheme();

  const bg = darkTheme ? 'bg-navy-dark' : 'bg-navy';

  return (
    <div className={`${bg} flex h-full flex-col justify-between border-r border-navy-light px-6 py-7`}>
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
