# Changelog

<!-- ⚠⚠ Please follow the format provided ⚠⚠ -->
<!-- Always use "1." at the start instead of "2. " or "X. " as GitHub will auto renumber everything. -->
<!-- Use the following format below -->
<!--  1. [Changed Area] Title of changes - @github username (Name)  -->

## 2.1.0

1. [UI] Add ability to change date layout - @FoxtrotSierra6829
1. [UI] Add progress bar to taskbar tab to show installation progress - @ErickSharp
1. [UI] Add ability to show third party licenses - @nistei
1. [ADDONS] Add Synaptic Simulations A22X placeholder - @MikeRomaa

## 2.0.1

1. [LOGIC] Fix error during configuration of settings on first installation - @nistei
1. [UI] Change link to experimental guide - @FoxtrotSierra6829

## 2.0.0

1. [LOGIC] Installation method changed from Electron-Forge/Squirel to electron-builder/NSIS to prevent future memory leaks during update @Benjozork - @FoxtrotSierra6829
1. [LOGIC] Remove converted livery packages if conversion failed - @Benjozork
1. [UI] Rename #help to #support to adopt current Discord channel naming - @FoxtrotSierra6829, @davidwalschots
1. [LOGIC] Request the user to set 'Community' folder manually if it cannot be found, fixes error message - @FoxtrotSierra68
1. [ADDONS] Update "Experimental" version text for A32NX - @FoxtrotSierra6829

## 1.2.0

1. [UI] Complete redesign of the installer - @Benjozork (Benjamin Dupont), @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [LOGIC] Add livery conversion tool - @Benjozork (Benjamin Dupont)
1. [LOGIC] Cleanup of old temporary directories on installer close and startup - @nistei (nistei#1362)

## 1.1.4

1. [LOGIC] Improved error prevention while downloading an update - @nistei (nistei#1362)
1. [LOGIC] Fix click on cancel causing a retry - @nistei (nistei#1362)

## 1.1.3

1. [LOGIC] Fix downloads failing in encrypted directories - @nistei (nistei#1362)
1. [LOGIC] Add retries for failed installs - @nistei (nistei#1362)
1. [ADDONS] Add "Experimental" version for A32NX - @Benjozork (Benjamin Dupont)

## 1.1.1

1. [LOGIC] Fix full downloads broken for some users - @nistei (nistei#1362)

## 1.1.0

1. [UI] Prevent text selection - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UI] Prevent image dragging - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [LOGIC] Disable preselecting different versions while downloading - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UX] Add Windows notification when download complete - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UX] Add changelog for the installer - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UI] Fix button styling in settings menu - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UX] Add report issue button at top right corner of installer - @Armankir (Arman#5297)
1. [UI] Changed the scrollbar color for eased visibility - @Armankir (Arman#5297)
1. [UI] New version selector UI - @marcsoler @ZigZag
1. [UX] Add warning message for experimental versions - @ZigTag
1. [LOGIC] Implement modular download - @nistei (nistei#1362)
1. [UI] Fix background image remaining black - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [UI] Fix window icon on hover - @FoxtrotSierra6829 (Foxtrot Sierra#6420)
1. [LOGIC] Fix unknown download state after switching tabs - @FoxtrotSierra6829 (Foxtrot Sierra#6420)

## 1.0.5

1. [UX] Disable offline modal due to issues @ZigTag

## 1.0.4

1. [LOGIC] Change CDN (download server) @ZigTag

## 1.0.3

1. [LOGIC] Improve 'MSFS is open' logic - @ZigTag

## 1.0.2

1. [LOGIC] Kill unnecessary child processes - @nistei (nistei#1362)

## 1.0.1

1. [LOGIC] Fix side menu install state - @Benjozork (Benjamin Dupont)
1. [UI] Change A380X status from 'not installed' to 'not available' - @ZigTag
1. [LOGIC] More accurate 'is installed' logic - @ZigTag
1. [UI] Change version name from 'FBW' to 'Custom FBW' - @ZigTag
