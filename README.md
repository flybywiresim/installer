![FlyByWire Simulations](https://raw.githubusercontent.com/flybywiresim/branding/1391fc003d8b5d439d01ad86e2778ae0bfc8b682/tails-with-text/FBW-Color-Light.svg#gh-dark-mode-only)
![FlyByWire Simulations](https://github.com/flybywiresim/branding/blob/master/tails-with-text/FBW-Color-Dark.svg#gh-light-mode-only)

# FlyByWire Simulations Installer

This repository contains the installer for FlyByWire Simulations projects such as the [A32NX](https://github.com/flybywiresim/a32nx).

## How to contribute

The installer is built as an [Electron Application](https://www.electronjs.org/) for Windows and Linux
using [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/).

### Requirements

Please make sure you have:

- [git](https://git-scm.com/downloads)
- [NodeJS 20](https://nodejs.org/en/)

If you want to build flatpaks (package:flatpak, package:linux, package:all) you will also need to install the following from your preferred package manager:

- [flatpak](https://flatpak.org/)
- [flatpak-builder](https://docs.flatpak.org/en/latest/building-introduction.html)

After installing flatpak add the flathub remote:

```shell script
flatpak --user remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```
### Get started

First fork the project and install the dependencies

```shell script
npm install
```

Then run the development server using

```shell script
npm run dev
```

To build the package as an executable application, run

```shell script
npm run package
```

On Windows this will build an .exe file, on Linux it will build as .AppImage, .deb and .rpm. If you wish to target specific ways of distribution, you may instead run:

```shell
npm run package:all # packages for all targets
npm run package:win # packages for windows (.exe)
npm run package:linux # packages for all linux targets (.AppImage,.deb,.rpm,.flatpak and .snap)
npm run package:appimage # packages as .AppImage
npm run package:deb # packages as .deb
npm run package:rpm # packages as .rpm
npm run package:snap # packages as .snap
npm run package:flatpak # packages as .flatpak
```

Packaged applications (.exe and .AppImage only) will automatically update if there is a newer version available (compared to build version in package.json). On windows, this does
also apply to development versions (ending on -devXX), which are updated via a separate stream. Updates are distributed once the build
version is changed and a tag has been added.
