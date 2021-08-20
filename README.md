# <img src="https://raw.githubusercontent.com/flybywiresim/fbw-branding/master/svg/FBW-Logo.svg" placeholder="FlyByWire" width="400"/>

# FlyByWire Simulations Installer

This repository contains the installer for FlyByWire Simulations projects such as the [A32NX](https://github.com/flybywiresim/a32nx).

## How to contribute

### Build dependencies

Please make sure you have:

- NodeJS 14 - [Homepage](https://nodejs.org/en/)

### Get started

First fork the project and install the dependencies

```shell script
npm install
```

Then run the development server using

```shell script
npm run start
```

To build the package as .exe, run

```shell script
npm run package
```

Packaged applications will automatically update if there is a newer version available (compared to build version in package.json), this does also apply to development versions (ending on -devXX), which are updated via a separate stream. Updates are distributed once the build version is changed and a tag has been added.
