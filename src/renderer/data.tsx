import { Configuration } from "./utils/InstallerConfiguration";

import FBWLogo from "renderer/assets/FBW-Tail.svg";
import SynapticLogo from "renderer/assets/Synaptic-Logo.png";
import A320NoseSVG from "renderer/assets/a32nx_nose.svg";
import A380NoseSVG from "renderer/assets/a380x_nose.svg";

export const defaultConfiguration: Configuration = {
    publishers: [
        {
            name: 'FlyByWire Simulations',
            logoUrl: FBWLogo,
            mainColor: '#00c2cc',
            addons: [
                {
                    name: 'A32NX',
                    repoOwner: 'flybywiresim',
                    repoName: 'a32nx',
                    gitHubReleaseBaseURL: 'https://github.com/flybywiresim/a32nx/releases/tag/',
                    aircraftName: 'A320neo',
                    key: 'A32NX',
                    enabled: true,
                    menuIconUrl: A320NoseSVG,
                    backgroundImageUrls: [
                        'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png'
                    ],
                    shortDescription: 'Airbus A320neo Series',
                    description: 'The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
                        'its A320 product line’s position as the world’s most advanced and fuel-efficient single-aisle ' +
                        'aircraft family. The baseline A320neo jetliner has a choice of two new-generation engines ' +
                        '(the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International) ' +
                        'and features large, fuel-saving wingtip devices known as Sharklets.',
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
                            description: 'Stable is our variant that has the least bugs and best performance. ' +
                                'This version will not always be up to date but we guarantee it\'s compatibility ' +
                                'with each major patch from MSFS.',
                            isExperimental: false,
                            releaseModel: {
                                type: 'githubRelease',
                            },
                        },
                        {
                            name: 'Development',
                            key: 'a32nx-dev',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/master',
                            // move old experimental users over to dev
                            alternativeUrls: [
                                'https://cdn.flybywiresim.com/addons/a32nx/cfbw-cap',
                                'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                                'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                            ],
                            description: 'Development will have the latest features that will end up in the next stable. ' +
                                'Bugs are to be expected. It updates whenever something is added to the \'master\' ' +
                                'branch on Github. Please visit our discord for support.',
                            isExperimental: false,
                            releaseModel: {
                                type: 'githubBranch',
                                branch: 'master',
                            },
                        },
                        /* {
                            name: 'Experimental',
                            key: 'experimental',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                            alternativeUrls: [],
                            description: 'This version is similar to the development version, but contains custom systems ' +
                                'still being developed, including the new FBW Custom Flight Management System (cFMS). ' +
                                'Experimental will be updated with the latest changes from both the ' +
                                '\'autopilot-custom-fpm\' branch and development version regularly. ' +
                                'No support will be offered via Discord for this version.',
                            isExperimental: true,
                            warningContent: 'The experimental version contains custom systems that more closely matches ' +
                                'real-life behaviour of an A320neo. Those are in development and bugs are to be expected.\n\n' +
                                'To understand what you are getting into and the potential issues you might experience, ' +
                                'please read [this guide](https://docs.flybywiresim.com/fbw-a32nx/support/exp/).\n\n' +
                                '**Please be aware that no support will be offered via Discord support channels.**',
                            releaseModel: {
                                type: 'githubBranch',
                                branch: 'experimental',
                            },
                        }, */
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
                {
                    name: 'KFBW',
                    aircraftName: 'KFBW airport',
                    key: 'KFBW',
                    enabled: true,
                    hidden: true,
                    hiddenName: 'A380X',
                    overrideAddonWhileHidden: 'A380X',
                    menuIconUrl: A380NoseSVG,
                    backgroundImageUrls: [],
                    shortDescription: 'FlyByWire Headquarters',
                    description: 'Welcome to KFBW! \n\n' +
                        'This is a showcase of the A380 project. Spawn at KFBW or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
                        'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
                        'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
                        'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
                        'Use the developer or drone camera to explore! \n\n' +
                        'Happy holidays and enjoy! -FBW Team',
                    targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
                    tracks: [
                        {
                            name: 'Release',
                            key: 'kfbw-release',
                            url: 'https://cdn.flybywiresim.com/addons/kfbw/release/',
                            isExperimental: false,
                            releaseModel: {
                                type: 'CDN',
                            },
                        },
                    ],
                },
            ]
        },
        {
            name: 'Synaptic Simulations',
            logoUrl: SynapticLogo,
            addons: [
                {
                    name: 'A22X',
                    repoOwner: 'Synaptic-Simulations',
                    repoName: 'a22x',
                    aircraftName: 'A220-300',
                    key: 'A22X',
                    enabled: false,
                    menuIconUrl: A320NoseSVG,
                    backgroundImageUrls: [],
                    shortDescription: 'Airbus A220-300 (CSeries 300)',
                    description: '',
                    targetDirectory: 'A22X',
                    alternativeNames: [],
                    tracks: [],
                },
            ],
        },
    ],
};
