import { Mod, ModVersion } from "renderer/components/App/index";

const GITHUB_API_BASE_URL = 'https://api.github.com';

export const GitHubApi = {
    /**
     * Obtains a list of versions for a particular mod from GitHub
     *
     * @param mod {Mod} the mod for which to obtain versions
     */
    async getVersions(mod: Mod): Promise<ModVersion[]> {
        const url = `${GITHUB_API_BASE_URL}/repos/flybywiresim/${mod.repoName}/releases`;

        const request: RequestInit = {
            headers: new Headers({
                'Accept': 'application/vnd.github.v3+json'
            })
        };

        const ghReleases: { tag_name: string, created_at: string }[] = await (await fetch(url, request)).json();

        return ghReleases.map(release => {
            const dateDay = release.created_at.substring(8, 10);
            const dateMonth = release.created_at.substring(5, 7);
            const dateYear = release.created_at.substring(2, 4);

            return {
                title: release.tag_name,
                date: `${dateDay}/${dateMonth}/${dateYear}`,
                type: 'minor'
            };
        });
    }
};
