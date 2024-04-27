import { Configuration } from './utils/InstallerConfiguration';

export const defaultConfiguration: Configuration = {
  version: 1,
  publishers: [
    {
      name: 'FlyByWire Simulations',
      key: 'flybywiresim',
      logoUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/publisher-icons/flybywiresim/0.svg',
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
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A320-251N',
          titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a32nx/dark.svg',
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a32nx/light.svg',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fbw-a32nx/1.png'],
          shortDescription: 'Airbus A320neo Series',
          description:
            'The A320neo (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
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
          alternativeNames: ['A32NX', 'a32nx'],
          tracks: [
            {
              name: 'Stable',
              key: 'a32nx-stable',
              url: 'https://flybywirecdn.com/addons/a32nx/stable',
              alternativeUrls: [
                'external/a32nx/stable',
                // move bunnycdn users to cloudflare
                'https://cdn.flybywiresim.com/addons/a32nx/stable',
              ],
              description:
                'Stable is our variant that has the least bugs and best performance. ' +
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
              url: 'https://flybywirecdn.com/addons/a32nx/master',
              alternativeUrls: [
                // move old experimental users over to dev
                'https://cdn.flybywiresim.com/addons/a32nx/cfbw-cap',
                'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                'external/a32nx/master',
                // move bunnycdn users to cloudflare
                'https://cdn.flybywiresim.com/addons/a32nx/master',
                // move exp users to dev
                'https://flybywirecdn.com/addons/a32nx/experimental',
                'external/a32nx/experimental',
                'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                'https://github.com/flybywiresim/a32nx/releases/download/assets/experimental/',
              ],
              description:
                'Development will have the latest features that will end up in the next stable. ' +
                "Bugs are to be expected. It updates whenever something is added to the 'master' " +
                'branch on Github. Please visit our discord for support.',
              isExperimental: false,
              releaseModel: {
                type: 'githubBranch',
                branch: 'master',
              },
            },
          ],
          dependencies: [
            {
              addon: '@flybywiresim/simbridge',
              optional: true,
              modalText:
                'SimBridge allows the A32NX to expose remote tools like the Web MCDU, as well as use the external terrain database.',
            },
          ],
          incompatibleAddons: [
            // title: the exact title as it appears in the manifest.json
            // creator: the exact creator as it appears in the manifest.json
            // packageVersion syntax follows: https://www.npmjs.com/package/semver
            // description: a short description of why the addon is incompatible
            {
              title: 'FlightFlow | IMPROVED TEXTURES MOD',
              creator: 'FlightFlow',
              description:
                'It is recommended to remove this add-on/mod before installing and using the A32NX. This add-on/mod is known to override A32NX components and cause unexpected behavior and issues when flying the A32NX.',
            },
            {
              title: 'Horizon Simulations A319ceo',
              packageVersion: '<0.6.1',
              description:
                'It is recommended to upgrade to the latest version (0.6.1 or later) or to remove this add-on before installing and using the A32NX. The older versions of this add-on are known to override A32NX components and to break the A32NX.',
            },
            {
              title: 'Horizon Simulations A321neo',
              // packageVersion: '<0.4.0', see https://discord.com/channels/738864299392630914/785976111875751956/1055617417189011546
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. This add-on is known to override A32NX components and cause unexpected behavior and issues when flying the A32NX.',
            },
            {
              title: 'LVFR A321neo FBW A32NX Compatibility Mod',
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. This add-on is known to override A32NX components and to break the A32NX.',
            },
            {
              title: 'LVFR A321neo Extreme',
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. This add-on is known to override A32NX components and cause unexpected behavior and issues when flying the A32NX.',
            },
            {
              title: 'lvfr-airbus-a319-fbw-standalone',
              packageVersion: '<0.6.1',
              description:
                'It is recommended to upgrade to the latest version (0.6.1 or later) or to remove this add-on before installing and using the A32NX. The older versions of this add-on are known to override A32NX components and to break the A32NX.',
            },
            {
              title: 'lvfr-airbus-a319-ceo-fbw-compatibility',
              // creator: 'FlyByWire Simulations, karuchie',
              // packageVersion: '<0.6.1',
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. This add-on is known to override A32NX components and cause unexpected behavior and issues when flying the A32NX.',
            },
            {
              title: '[MOD] Mugz FBW A32NX Dev',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and renders the A32NX unusable.',
            },
            {
              title: '[MOD] Mugz FBW A32NX Stable',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and renders the A32NX unusable.',
            },
            {
              title: 'Toolbar Pushback',
              creator: 'AmbitiousPilots',
              description:
                'This add-on sometimes causes performance issues and also sometimes prevents the A32NX from taxiing. Consider removing it if you experience these issues.',
            },
            {
              title: 'Asobo_A320_A (A32NX Converted)',
              creator: 'UnitDeath',
              description:
                'It is required to remove this livery before installing and using the A32NX as it breaks the A32NX',
            },
            {
              title: 'xeffect-320',
              creator: 'swingbird',
              // packageVersion: '<0.1.2', (the mod does provide accurate version info in manifest.json)
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. It is known known to override A32NX files and to break the A32NX.',
            },
            {
              title: 'z-Newlight-settinglight-FBW-A320NX-dev',
              creator: 'Nicottine',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and renders the A32NX unusable.',
            },
            {
              title: 'z-Newlight-settinglight-FBW-A320NX-stable',
              creator: 'Nicottine',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and renders the A32NX unusable.',
            },
            {
              title: 'z-Newlight-settinglight-FBW-A320NX-EXP',
              creator: 'Nicottine',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and renders the A32NX unusable.',
            },
            {
              title: 'FBW A32NX Weather Radar Mod',
              creator: '',
              description:
                'It is required to remove this add-on before installing and using the A32NX. This add-on overrides A32NX components and may render the A32NX unusable.',
            },
            {
              title: 'China Eastern',
              creator: 'JasonC68',
              description:
                'It is recommended to remove this add-on before installing and using the A32NX. This add-on is known to override A32NX components and cause unexpected behavior and issues when flying the A32NX.',
            },
          ],
          myInstallPage: {
            links: [
              {
                url: 'https://docs.flybywiresim.com/fbw-a32nx/',
                title: 'Documentation',
              },
            ],
            directories: [
              {
                location: {
                  in: 'packageCache',
                  path: 'work',
                },
                title: 'Work Folder',
              },
            ],
          },
          disallowedRunningExternalApps: ['@/msfs', '@/mcdu-server'],
        },
        {
          name: 'A380X',
          key: 'A380X',
          repoOwner: 'flybywiresim',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A380-842',
          titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a380x/dark.svg',
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-a380x/light.svg',
          enabled: false,
          backgroundImageUrls: [
            'https://nyc3.digitaloceanspaces.com/fselite/2020/11/123263426_126778999193686_7966913238295950901_o.png',
          ],
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
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-kfbw/light.svg',
          shortDescription: 'FlyByWire Headquarters',
          description:
            'Welcome to KFBW! \n\n' +
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
              description:
                'FlyByWire Headquarters is transformed into a winter wonderland - complete with a plethora of festive decorations in addition to the standard progress showcase.',
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
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fbw-simbridge/light.svg',
          enabled: true,
          backgroundImageUrls: [
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fbw-simbridge/0.png',
          ],
          backgroundImageShadow: false,
          shortDescription: 'Airbus A380-800',
          description:
            'SimBridge is an external application which allows FBW aircraft to communicate with components located outside the simulator. SimBridge will be used for a number of features requiring external data (such as TAWS terrain display), as well as for functionality providing remote access to aircraft systems or data.',
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
              description:
                'SimBridge is an external app that enables FlyByWire Simulations aircraft to communicate outside your simulator. From remote displays to external terrain display rendering, it is used for a variety of optional features.',
            },
          ],
          disallowedRunningExternalApps: ['@/simbridge-app'],
          backgroundService: {
            executableFileBasename: 'fbw-simbridge',
            runCheckExternalAppRef: '@/simbridge-app',
            commandLineArgs: ['--hide'],
          },
          myInstallPage: {
            links: [
              {
                url: 'https://docs.flybywiresim.com/simbridge/',
                title: 'Documentation',
              },
            ],
            directories: [
              {
                location: {
                  in: 'package',
                  path: 'resources',
                },
                title: 'Resources',
              },
            ],
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
      logoUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/publisher-icons/salty/0.svg',
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
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/salty-74S/light.svg',
          enabled: true,
          backgroundImageUrls: [
            'https://raw.githubusercontent.com/saltysimulations/branding/main/png/salty_banner.png',
          ],
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
              description:
                'Stable is our variant that has the least bugs and best performance. ' +
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
      name: 'FSLTL',
      key: 'fsltl',
      logoUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/publisher-icons/fsltl/fsltl-test-2.png',
      logoSize: 36,
      defs: [
        {
          kind: 'externalApp',
          key: 'traffic-injector-app',
          prettyName: 'FSLTL Traffic Injector',
          detectionType: 'http',
          url: 'http://localhost:42888',
          killUrl: 'http://localhost:42888/kill',
          killMethod: 'POST',
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
          key: 'traffic-base-models',
          name: 'FSLTL Traffic',
          aircraftName: 'FSLTL Traffic',
          titleImageUrl:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fsltl/base-models/dark.svg',
          titleImageUrlSelected:
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fsltl/base-models/light.svg',
          enabled: true,
          backgroundImageUrls: [
            'https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fsltl/traffic/0.png'
          ],
          shortDescription: 'FSLTL Traffic Base Models',
          description:
            'FSLTL is a free standalone real-time online traffic overhaul and VATSIM model-matching solution for MSFS.\n\n' +
            'Utilising native glTF models and MSFS independent online IFR/VFR traffic injection system with stock ATC interaction based on Flightradar24.\n\n' +
            'This is the base model / livery pack required for FSLTL Injector, MSFS default live traffic or VATSIM use.',
          targetDirectory: 'fsltl-traffic-base',
          alternativeNames: [],
          tracks: [
            {
              name: 'Stable',
              key: 'release',
              url: 'https://github.com/FSLiveTrafficLiveries/base/releases/latest/download/',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
              description:
                'Stable release of the aircraft models, liveries and VMR file.\n\n' +
                'This packages is required to see matched models / liveries if you are using FSLTL Injector, MSFS default live traffic or VATSIM.\n\n' +
                'A vmr file is provided in the package for VATSIM client use.',
            },
          ],
          disallowedRunningExternalApps: ['@/msfs'],
        },
        {
          key: 'traffic-injector',
          name: 'FSLTL Injector',
          aircraftName: 'FSLTL Traffic',
          titleImageUrl: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fsltl/injector/dark.svg',
          titleImageUrlSelected: 'https://flybywiresim.b-cdn.net/installer/media-assets/addon-titles/fsltl/injector/light.svg',
          enabled: true,
          backgroundImageUrls: ['https://flybywiresim.b-cdn.net/installer/media-assets/addon-headers/fsltl/traffic/0.png'],
          shortDescription: 'FSLTL Traffic Injector Software',
          description: 'FSLTL Live Traffic Injector - giving you a more immersive experience at airports globally!\n\n'+
          '- Live IFR and VFR traffic based on Flightradar24\n\n'+
          '- Parked aircraft based on historic real data for immersive full airports\n\n'+
          '- Ability to have any combination of IFR, VFR and parked aircraft',
          targetDirectory: 'fsltl-traffic-injector',
          tracks: [
            {
              name: 'Stable',
              key: 'release',
              url: 'https://github.com/FSLiveTrafficLiveries/FSLTL_Injector_Releases/releases/latest/download/',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
              description: 'Stable version of the FSLTL Traffic Injector for use on stable versions of MSFS.\n\n'+
              'Follow the user guide at https://www.fslivetrafficliveries.com/user-guide/ before use.',
            },
            {
              name: 'Experimental',
              key: 'development',
              url: 'https://github.com/FSLiveTrafficLiveries/FSLTL_Injector_Releases/releases/download/beta/',
              isExperimental: true,
              warningContent: 'No support is offered for this release, it is a preview of features that may be included in future releases.',
              releaseModel: {
                type: 'CDN',
              },
              description: 'Experimental Release that includes features that are not yet ready for stable release.\n\n'+
              'You can provide feedback on these new features in the FSLTL Discord.\n\n'+
              'No support is offered for issues with this release, new FSLTL users should use stable.'
            },
          ],
          backgroundService: {
            executableFileBasename: 'fsltl-trafficinjector',
            runCheckExternalAppRef: '@/traffic-injector-app',
            enableAutostartConfiguration: false,
          },
          disallowedRunningExternalApps: ['@/traffic-injector-app'],
        },
      ],
      buttons: [
        {
          text: 'Website',
          action: 'openBrowser',
          url: 'https://www.fslivetrafficliveries.com/',
        },
        {
          text: 'Discord',
          action: 'openBrowser',
          url: 'https://discord.gg/suMR56wCrn',
          inline: true,
        },
        {
          text: 'User Guide',
          action: 'openBrowser',
          url: 'https://www.fslivetrafficliveries.com/user-guide/',
        },
        {
          text: 'Support FAQ',
          action: 'openBrowser',
          url: 'https://www.fslivetrafficliveries.com/support-faq/',
        },
      ],
    },
  ],
};
