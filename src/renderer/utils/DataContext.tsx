import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";
import { useParams } from "react-router-dom";
import { AircraftSectionURLParams } from "renderer/components/AddonSection";
import { useAppSelector } from "renderer/redux/store";

export interface DataContext {
    publisher: Publisher | undefined,
    addon: Addon | undefined,
}

export const useDataContext = (): DataContext => {
    const { publisherKey, addonKey } = useParams<AircraftSectionURLParams>();

    const publisher = useAppSelector((state) => state.configuration.publishers.find(pub => pub.key === publisherKey) ?? state.configuration.publishers[0]);
    const addon = publisher.addons.find((addon) => addon.key === addonKey);

    return { publisher, addon };
};
