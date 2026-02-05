# How to build a Release

Only relevant to repository maintainers.

- Make sure all PRs for the release are merged to the `master` branch
- For minor releases create a new branch on the repo from master (e.g. `v.3.4`)
- In the new release branch on your local machine:
    - Cherry Pick all commits from the `master` branch you want included in the release
    - Update the version (several places) in `package.json` and `package-lock.json`
    - Create a Release Candidate for testing:
        - Add a new tag with the version number (e.g. `v3.4.4-rc.1`)
        - Push the commits and tag to the repo
        - The CI will build the release candidate (because of the tag) and add it to the GitHub releases
        - Test the release candidate
    - If the release candidate is good
        - Update the version (several places) in `package.json` and `package-lock.json`
        - Create a new tag with the version number (e.g. `v3.4.4`)
        - Push the commits and tag to the repo
        - The CI will build the release and add it to the GitHub releases
- Bump the version in the `master` branch to the next version (e.g. `3.4.5-dev.1`)
