![FlyByWire Simulations](https://raw.githubusercontent.com/flybywiresim/branding/1391fc003d8b5d439d01ad86e2778ae0bfc8b682/tails-with-text/FBW-Color-Light.svg#gh-dark-mode-only)
![FlyByWire Simulations](https://github.com/flybywiresim/branding/blob/master/tails-with-text/FBW-Color-Dark.svg#gh-light-mode-only)

# FlyByWire Simulations Installer

This repository contains the installer for FlyByWire Simulations projects such as the [A32NX](https://github.com/flybywiresim/a32nx).

## How to contribute

The installer is built as an [Electron Application](https://www.electronjs.org/) for Windows
using [TypeScript](https://www.typescriptlang.org/) and [React](https://reactjs.org/).

### Requirements

Please make sure you have:

- [git](https://git-scm.com/downloads)
- [NodeJS 20](https://nodejs.org/en/)

### Get started

First fork the project and install the dependencies

```shell script
npm install
```

Then run the development server using

```shell script
npm run dev
```

To build the package as .exe, run

```shell script
npm run package
```

Packaged applications will automatically update if there is a newer version available (compared to build version in package.json), this does
also apply to development versions (ending on -devXX), which are updated via a separate stream. Updates are distributed once the build
version is changed and a tag has been added.
