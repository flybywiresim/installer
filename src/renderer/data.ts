import { Configuration } from "./utils/InstallerConfiguration";

import FBWLogo from "renderer/assets/FBW-Tail.svg";
import SynapticLogo from "renderer/assets/Synaptic-Logo.png";
import SaltyLogo from "renderer/assets/Salty-Logo.svg";

export const defaultConfiguration: Configuration = {
    publishers: [
        {
            name: 'FlyByWire Simulations',
            key: 'flybywiresim',
            logoUrl: FBWLogo,
            defs: [
                {
                    kind: 'addonCategory',
                    key: 'aircraft',
                    title: 'Aircraft',
                },
                {
                    kind: 'addonCategory',
                    key: 'scenery',
                    title: 'Scenery',
                },
                {
                    kind: 'addonCategory',
                    key: 'simbridge',
                    styles: ['align-bottom'],
                },
                {
                    kind: 'externalApp',
                    key: 'mcdu-server',
                    prettyName: 'MCDU Server',
                    detectionType: 'ws',
                    url: 'ws://localhost:8380',
                },
                {
                    kind: 'externalApp',
                    key: 'simbridge-app',
                    prettyName: 'SimBridge',
                    detectionType: 'http',
                    url: 'http://localhost:8380/health',
                    killUrl: 'http://localhost:8380/health/kill',
                    killMethod: 'GET',
                },
                {
                    kind: 'externalApp',
                    key: 'msfs',
                    prettyName: 'MSFS',
                    detectionType: 'tcp',
                    port: 500,
                },
            ],
            addons: [
                {
                    key: 'A32NX',
                    name: 'A32NX',
                    repoOwner: 'flybywiresim',
                    repoName: 'a32nx',
                    category: '@aircraft',
                    aircraftName: 'A320-251N',
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a32nx/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a32nx/light.svg',
                    enabled: true,
                    // TODO: Change this
                    backgroundImageUrls: ['https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fbw-a32nx/1.png'],
                    shortDescription: 'Airbus A320neo Series',
                    description: 'The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
                        'its A320 product line’s position as the world’s most advanced and fuel-efficient single-aisle ' +
                        'aircraft family. The baseline A320neo jetliner has a choice of two new-generation engines ' +
                        '(the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International) ' +
                        'and features large, fuel-saving wingtip devices known as Sharklets.',
                    techSpecs: [
                        {
                            name: 'Engines',
                            value: 'CFM LEAP 1A-26',
                        },
                        {
                            name: 'APU',
                            value: 'APS3200',
                        },
                    ],
                    targetDirectory: 'flybywire-aircraft-a320-neo',
                    alternativeNames: [
                        'A32NX',
                        'a32nx',
                    ],
                    tracks: [
                        {
                            name: 'Stable',
                            key: 'a32nx-stable',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/stable',
                            alternativeUrls: [
                                'external/a32nx/stable',
                            ],
                            description: 'Stable is our variant that has the least bugs and best performance. ' +
                                'This version will not always be up to date but we guarantee its compatibility ' +
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
                            alternativeUrls: [
                                'external/a32nx/master',
                                // move old experimental users over to dev
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
                        {
                            name: 'Experimental',
                            key: 'experimental',
                            url: 'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                            alternativeUrls: [
                                'external/a32nx/experimental',
                            ],
                            description: 'This version is similar to the Development version, ' +
                                'but contains features that we wish to test publicly as we perfect them. ' +
                                'The build is in practice stable most of the time, but you may encounter flight-breaking bugs, ' +
                                'performance loss, crashes or other issues as the features present in this version are not completely finished. ' +
                                'Not advised for flying on online networks.',
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
                        },
                    ],
                    dependencies: [
                        {
                            addon: '@flybywiresim/simbridge',
                            optional: true,
                            modalText: 'SimBridge allows the A32NX to expose remote tools like the Web MCDU, as well as use the external terrain database.',
                        },
                    ],
                    disallowedRunningExternalApps: ['@/msfs', '@/mcdu-server', '@/simbridge-app'],
                },
                {
                    name: 'A380X',
                    key: 'A380X',
                    repoOwner: 'flybywiresim',
                    repoName: 'a380x',
                    category: '@aircraft',
                    aircraftName: 'A380-841',
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a380x/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a380x/light.svg',
                    enabled: false,
                    backgroundImageUrls: ['https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png'],
                    shortDescription: 'Airbus A380-800',
                    description: '',
                    targetDirectory: 'A380',
                    tracks: [],
                    disallowedRunningExternalApps: ['@/msfs'],
                },
                {
                    name: 'KFBW',
                    key: 'KFBW',
                    category: '@scenery',
                    aircraftName: 'FBW Headquarters',
                    enabled: true,
                    overrideAddonWhileHidden: 'A380X',
                    backgroundImageUrls: ['https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fbw-kfbw/0.png'],
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-kfbw/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-kfbw/light.svg',
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
                            description: 'FlyByWire Headquarters is transformed into a winter wonderland - complete with a plethora of festive decorations in addition to the standard progress showcase.',
                        },
                    ],
                },
                {
                    name: 'SimBridge',
                    key: 'simbridge',
                    category: '@simbridge',
                    repoOwner: 'flybywiresim',
                    repoName: 'simbridge',
                    aircraftName: 'FBW SimBridge',
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-simbridge/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-simbridge/light.svg',
                    enabled: true,
                    backgroundImageUrls: ['https://cdn.discordapp.com/attachments/845070631644430359/982713039696560128/simbridge.png'],
                    backgroundImageShadow: false,
                    shortDescription: 'Airbus A380-800',
                    description: '',
                    targetDirectory: 'flybywire-externaltools-simbridge',
                    tracks: [
                        {
                            name: 'Release',
                            key: 'release',
                            releaseModel: {
                                type: 'githubRelease',
                            },
                            url: 'https://cdn.flybywiresim.com/addons/simbridge/release/',
                            isExperimental: false,
                            description: 'SimBridge is an external app that enables FlyByWire Simulations aircraft to communicate outside your simulator. From remote displays to external terrain display rendering, it is used for a variety of optional features.',
                        },
                    ],
                    // configurationAspects: [
                    //     {
                    //         key: 'terrain-db',
                    //         tabTitle: 'Terrain Database',
                    //         tabSupertitle: 'Update',
                    //         title: 'Enable or Disable Terrain Database',
                    //         applyChoiceKeyTo: 'optionalFragmenterModule',
                    //         choiceKind: 'yesNo',
                    //         choices: [
                    //             {
                    //                 key: 'yes',
                    //                 title: '@translations[Data.FBW.SimBridge.ConfigTerrainDB.ChoiceYes.Title]',
                    //                 description: 'Download and install the terrain database to enable terrain display in the FBW A32NX and A380X addons.',
                    //             },
                    //             {
                    //                 key: 'yes',
                    //                 title: 'Disable Terrain Database',
                    //                 description: 'Do not install the terrain database. Terrain display will not be available in the FBW A32NX and A380X addons.',
                    //             },
                    //         ],
                    //     },
                    // ],
                    disallowedRunningExternalApps: ['@/simbridge-app'],
                    backgroundService: {
                        executableFileBasename: 'fbw-simbridge',
                        runCheckExternalAppRef: '@/simbridge-app',
                        commandLineArgs: ['--hide'],
                    },
                },
            ],
            buttons: [
                {
                    text: 'Documentation',
                    action: 'openBrowser',
                    url: 'https://docs.flybywiresim.com/',
                },
                {
                    text: 'Website',
                    action: 'openBrowser',
                    url: 'https://flybywiresim.com/',
                },
                {
                    text: 'Discord',
                    action: 'openBrowser',
                    url: 'https://discord.gg/flybywire',
                },
                {
                    text: 'Twitter',
                    action: 'openBrowser',
                    url: 'https://twitter.com/FlyByWireSim',
                    inline: true,
                },
            ],
        },
        {
            name: 'Salty Simulations',
            key: 'salty',
            logoUrl: SaltyLogo,
            defs: [
                {
                    kind: 'addonCategory',
                    key: 'aircraft',
                    title: 'Aircraft',
                },
            ],
            addons: [
                {
                    key: '74S',
                    name: '74S',
                    repoOwner: 'saltysimulations',
                    repoName: 'salty-747',
                    category: '@aircraft',
                    aircraftName: 'B747-8I',
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/salty-74S/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/salty-74S/light.svg',
                    enabled: true,
                    backgroundImageUrls: ['https://raw.githubusercontent.com/saltysimulations/branding/main/png/salty_banner.png'],
                    shortDescription: 'Boeing 747-8I',
                    description:
                        'The Boeing 747-8 is the largest variant of the 747. ' +
                        'It features a thicker and wider wing, allowing it to hold more fuel, as well as raked wingtips. ' +
                        'The aircraft, powered by the more efficient General Electric GEnx engines, ' +
                        'can carry 467 passengers in a typical three-class configuration, and has a range of 7,730 nautical miles.',
                    techSpecs: [
                        {
                            name: 'Engines',
                            value: 'GEnx-2B',
                        },
                    ],
                    targetDirectory: 'salty-747',
                    tracks: [
                        {
                            name: 'Stable',
                            key: '74S-stable',
                            url: 'https://github.com/saltysimulations/salty-747/releases/download/vinstaller-stable/',
                            description: 'Stable is our variant that has the least bugs and best performance. ' +
                                'This version will not always be up to date but we guarantee its compatibility ' +
                                'with each major patch from MSFS.',
                            isExperimental: false,
                            releaseModel: {
                                type: 'githubRelease',
                            },
                        },
                        {
                            name: 'Development',
                            key: '74S-dev',
                            url: 'https://github.com/saltysimulations/salty-747/releases/download/vinstaller/',
                            description:
                                'The development version has all the latest features that will end up in the next stable. ' +
                                'You may encounter bugs more frequently.',
                            isExperimental: false,
                            releaseModel: {
                                type: 'githubBranch',
                                branch: 'master',
                            },
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: 'Discord',
                    action: 'openBrowser',
                    url: 'https://discord.gg/S4PJDwk',
                },
                {
                    text: 'Twitter',
                    action: 'openBrowser',
                    url: 'https://twitter.com/Salty_Sim',
                    inline: true,
                },
            ],
        },
        {
            name: 'Synaptic Simulations',
            key: 'synaptic',
            logoUrl: SynapticLogo,
            defs: [
                {
                    kind: 'addonCategory',
                    key: 'aircraft',
                    title: 'Aircraft',
                },
            ],
            addons: [
                {
                    name: 'A22X',
                    repoOwner: 'Synaptic-Simulations',
                    repoName: 'a22x',
                    category: '@aircraft',
                    aircraftName: 'A220-300',
                    titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/synaptic-a22x/dark.svg',
                    titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/synaptic-a22x/light.svg',
                    key: 'A22X',
                    enabled: false,
                    backgroundImageUrls: ['https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png'],
                    shortDescription: 'Airbus A220-300 (CSeries 300)',
                    description: '',
                    targetDirectory: 'A22X',
                    alternativeNames: [],
                    tracks: [],
                },
            ],
            buttons: [
                {
                    text: 'Website',
                    action: 'openBrowser',
                    url: 'https://www.synapticsim.com/',
                },
                {
                    text: 'Discord',
                    action: 'openBrowser',
                    url: 'https://discord.gg/acQkSvrePG',
                },
                {
                    text: 'Twitter',
                    action: 'openBrowser',
                    url: 'https://twitter.com/synapticsim',
                    inline: true,

                },
            ],
        },
    ],
};
