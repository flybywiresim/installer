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
            addons: [
                {
                    name: 'A32NX',
                    repoOwner: 'flybywiresim',
                    repoName: 'a32nx',
                    aircraftName: 'A320-251N',
                    titleImageUrl: 'https://media.discordapp.net/attachments/806767835355152394/918704262031228938/A32NX-Logo-LightBG.png',
                    titleImageUrlSelected: 'https://media.discordapp.net/attachments/806767835355152394/918701098976575540/A32NX-Logo-DarkBG-Mono.png',
                    key: 'A32NX',
                    enabled: true,
                    menuIconUrl: A320NoseSVG,
                    // TODO: Change this
                    backgroundImageUrl: 'https://media.discordapp.net/attachments/742814829680656496/916731692096561183/unknown.png?width=1404&height=670',
                    shortDescription: 'Airbus A320neo Series',
                    description: 'The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
                        'its A320 product line’s position as the world’s most advanced and fuel-efficient single-aisle ' +
                        'aircraft family. The baseline A320neo jetliner has a choice of two new-generation engines ' +
                        '(the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International) ' +
                        'and features large, fuel-saving wingtip devices known as Sharklets.',
                    techSpecs: [
                        {
                            name: 'Model',
                            value: 'A320-251N',
                        },
                        {
                            name: 'Engines',
                            value: 'CFM LEAP 1A-26',
                        },
                        {
                            name: 'APU',
                            value: 'APS3200',
                        }
                    ],
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
                        {
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
                        },
                    ],
                },
                {
                    name: 'A380X',
                    repoName: 'a380x',
                    aircraftName: 'A380-841',
                    titleImageUrl: 'https://media.discordapp.net/attachments/806767835355152394/918704262031228938/A32NX-Logo-LightBG.png',
                    titleImageUrlSelected: 'https://media.discordapp.net/attachments/806767835355152394/918701098976575540/A32NX-Logo-DarkBG-Mono.png',
                    key: 'A380X',
                    enabled: false,
                    menuIconUrl: A380NoseSVG,
                    backgroundImageUrl: 'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png',
                    shortDescription: 'Airbus A380-800',
                    description: '',
                    targetDirectory: 'A380',
                    tracks: [],
                },
            ],
            buttons: [
                {
                    text: 'MCDU',
                    action: 'internal',
                    call: 'fbw-remote-mcdu',
                    icon: 'Tablet',
                    inop: true,
                    inline: true,
                },
                {
                    text: 'flyPad',
                    action: 'internal',
                    call: 'fbw-remote-flypad',
                    icon: 'TabletLandscape',
                    inop: true,
                    inline: true,
                },
                {
                    text: 'Documentation',
                    action: 'openBrowser',
                    url: 'https://docs.flybywiresim.com/',
                    icon: 'BlockquoteLeft',
                    inline: false,
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
                    titleImageUrl: 'https://media.discordapp.net/attachments/806767835355152394/918704262031228938/A32NX-Logo-LightBG.png',
                    titleImageUrlSelected: 'https://media.discordapp.net/attachments/806767835355152394/918701098976575540/A32NX-Logo-DarkBG-Mono.png',
                    key: 'A22X',
                    enabled: false,
                    menuIconUrl: A320NoseSVG,
                    backgroundImageUrl: 'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png',
                    shortDescription: 'Airbus A220-300 (CSeries 300)',
                    description: '',
                    targetDirectory: 'A22X',
                    alternativeNames: [],
                    tracks: [],
                },
            ],
            buttons: [
                {
                    text: 'Discord',
                    icon: 'Link45deg',
                    action: 'openBrowser',
                    url: 'bruh',
                },
                {
                    text: 'Twitter',
                    icon: 'Link45deg',
                    action: 'openBrowser',
                    url: 'bruh',
                    inline: true,
                },
                {
                    text: 'Website',
                    icon: 'BlockquoteLeft',
                    action: 'openBrowser',
                    url: 'bruh',
                }
            ]
        },
    ],
};
