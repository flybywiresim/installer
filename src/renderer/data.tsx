import { Configuration } from "./utils/InstallerConfiguration";

import A320NoseSVG from "renderer/assets/a32nx_nose.svg";
import A380NoseSVG from "renderer/assets/a380x_nose.svg";

export const defaultConfiguration: Configuration = {
    mods: [
        {
            name: 'A32NX',
            repoName: 'a32nx',
            aircraftName: 'A320neo',
            key: 'A32NX',
            enabled: true,
            menuIconUrl: A320NoseSVG,
            backgroundImageUrls: [
                'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png'
            ],
            shortDescription: "t('AircraftSection.A32NX.ShortDesc')",
            description: "t('AircraftSection.A32NX.Desc')",
            targetDirectory: 'flybywire-aircraft-a320-neo',
            alternativeNames: [
                'A32NX',
                'a32nx'
            ],
            tracks: [
                {
                    name: "t('AircraftSection.A32NX.Versions.Stable.Name')",
                    key: 'a32nx-stable',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/stable',
                    description: "t('AircraftSection.A32NX.Versions.Stable.Desc')",
                    isExperimental: false,
                    releaseModel: {
                        type: 'githubRelease',
                    },
                },
                {
                    name: "t('AircraftSection.A32NX.Versions.Development.Name')",
                    key: 'a32nx-dev',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/master',
                    // move old experimental users over to dev
                    alternativeUrls: [
                        'https://cdn.flybywiresim.com/addons/a32nx/cfbw-cap',
                        'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                    ],
                    description: "t('AircraftSection.A32NX.Versions.Development.Desc')",
                    isExperimental: false,
                    releaseModel: {
                        type: 'githubBranch',
                        branch: 'master',
                    },
                },
                {
                    name: "t('AircraftSection.A32NX.Versions.Experimental.Name')",
                    key: 'experimental',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                    alternativeUrls: [],
                    description: "t('AircraftSection.A32NX.Versions.Experimental.Desc')",
                    isExperimental: true,
                    warningContent: "t('AircraftSection.A32NX.Versions.Experimental.WarningContent')",
                    releaseModel: {
                        type: 'githubBranch',
                        branch: 'experimental',
                    },
                },
            ],
        },
        {
            name: 'A380X',
            repoName: 'a380x',
            aircraftName: 'A380',
            key: 'A380X',
            enabled: false,
            menuIconUrl: A380NoseSVG,
            backgroundImageUrls: [],
            shortDescription: 'Airbus A380-800',
            description: '',
            targetDirectory: 'A380',
            tracks: [],
        },
    ],
};
