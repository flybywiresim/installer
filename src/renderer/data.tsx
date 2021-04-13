import React from "react";
import { Translation } from 'react-i18next';
import { shell } from "electron";
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
            shortDescription:
                <Translation>
                    {
                        (t) => <p>{t('AircraftSection.A32NX.ShortDesc')}</p>
                    }
                </Translation>,
            description:
                <Translation>
                    {
                        (t) => <p>{t('AircraftSection.A32NX.Desc')}</p>
                    }
                </Translation>,
            targetDirectory: 'flybywire-aircraft-a320-neo',
            alternativeNames: [
                'A32NX',
                'a32nx'
            ],
            tracks: [
                {
                    name: 'Stable',
                    key: 'a32nx-stable',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/stable',
                    description:
                        <Translation>
                            {
                                (t) => <p>{t('AircraftSection.A32NX.Versions.Stable.Desc')}</p>
                            }
                        </Translation>,
                    isExperimental: false,
                    releaseModel: {
                        type: 'githubRelease',
                    },
                },
                {
                    name: 'Development',
                    key: 'a32nx-dev',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/master',
                    description:
                        <Translation>
                            {
                                (t) => <p>{t('AircraftSection.A32NX.Versions.Development.Desc')}</p>
                            }
                        </Translation>,
                    isExperimental: false,
                    releaseModel: {
                        type: 'githubBranch',
                        branch: 'master',
                    },
                },
                {
                    name: 'Experimental',
                    key: 'experimental',
                    url: 'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                    alternativeUrls: [
                        'https://cdn.flybywiresim.com/addons/a32nx/cfbw-cap',
                        'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                    ],
                    description:
                        <Translation>
                            {
                                (t) => <p>{t('AircraftSection.A32NX.Versions.Experimental.Desc')}</p>
                            }
                        </Translation>,
                    isExperimental: true,
                    warningContent:
                        <Translation>
                            {
                                (t) => <>
                                    <p>{t('AircraftSection.A32NX.Versions.Experimental.WarningContent.Desc')}</p>
                                    <p>{t('AircraftSection.A32NX.Versions.Experimental.WarningContent.PleaseRead')} <a onClick={() => shell.openExternal("https://github.com/flybywiresim/a32nx/blob/experimental/docs/README.md")}>{t('AircraftSection.A32NX.Versions.Experimental.WarningContent.ThisGuide')}</a>.</p>

                                    <p className="mt-1 font-bold">{t('AircraftSection.A32NX.Versions.Experimental.WarningContent.NoSupport')}</p>
                                </>
                            }
                        </Translation>,
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
            shortDescription:
                <Translation>
                    {
                        (t) => <p>{t('AircraftSection.A380X.ShortDesc')}</p>
                    }
                </Translation>,
            description:
                <Translation>
                    {
                        (t) => <p>{t('AircraftSection.A380X.Desc')}</p>
                    }
                </Translation>,
            targetDirectory: 'A380',
            tracks: [],
        },
    ],
};
