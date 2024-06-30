import { Octokit } from '@octokit/rest';
import React, { FC, createContext, useContext, useState } from 'react';
import { useSetting } from 'renderer/rendererSettings';
import { Addon } from 'renderer/utils/InstallerConfiguration';

export interface GitHubContextInterface {
  client: Octokit | null;
  auth: () => void;
  fetchPrs: () => Promise<any>;
  getPrCommitSha: (prId: number, addon: Addon) => Promise<any>;
  getPrArtifactUrl: (prId: number, addon: Addon) => Promise<any>;
  prs: any[];
}

const GitHubContext = createContext<GitHubContextInterface>(undefined);

export const useGitHub = (): GitHubContextInterface => useContext(GitHubContext);

export const GitHubProvider: FC = ({ children }) => {
  const [gitHubToken] = useSetting('mainSettings.gitHubToken');
  const [prs, setPrs] = useState([]);

  const [client, setClient] = useState(
    gitHubToken
      ? new Octokit({
          auth: gitHubToken,
        })
      : new Octokit(),
  );

  const auth = () => {
    setClient(
      new Octokit({
        auth: gitHubToken,
      }),
    );
  };

  const fetchPrs = async () => {
    const resp = await client.rest.pulls.list({
      owner: 'flybywiresim',
      repo: 'aircraft',
      state: 'open',
    });

    console.log(resp.data);

    setPrs(resp.data);
  };

  const getPrCommitSha = async (prId: number, addon: Addon) => {
    const prInfo = await client.rest.pulls.get({
      owner: addon.repoOwner,
      repo: addon.repoName,
      pull_number: prId,
    });

    return prInfo.data.head.sha;
  };

  const getPrArtifactUrl = async (prId: number, addon: Addon) => {
    const prInfo = await client.rest.pulls.get({
      owner: addon.repoOwner,
      repo: addon.repoName,
      pull_number: prId,
    });

    console.log(prInfo);

    // const commitInfo = await client.rest.git.getCommit({
    //   owner: 'flybywiresim',
    //   repo: 'aircraft',
    //   commit_sha: prInfo.data.base.sha,
    // });

    const checkList = await client.rest.checks.listForRef({
      owner: addon.repoOwner,
      repo: addon.repoName,
      ref: prInfo.data.head.sha,
    });

    const check = checkList.data.check_runs.find((value) => value.name === 'Build and upload A32NX');

    console.log(checkList);

    const runId = check.html_url.slice(54, 64);

    const artifactList = await client.rest.actions.listWorkflowRunArtifacts({
      owner: addon.repoOwner,
      repo: addon.repoName,
      run_id: Number(runId),
    });

    console.log(artifactList.data);

    const artifact = artifactList.data.artifacts.find((val) => val.name === 'flybywire-aircraft-a320-neo');

    console.log(artifact.archive_download_url);

    // const artifactURL = await client.rest.actions.downloadArtifact({
    //   owner: 'flybywiresim',
    //   repo: 'aircraft',
    //   artifact_id: artifact.id,
    //   archive_format: 'zip',
    // });
    // console.log(artifactURL);

    return artifact.archive_download_url;
  };

  return (
    <GitHubContext.Provider value={{ client, auth, fetchPrs, getPrCommitSha, getPrArtifactUrl, prs }}>
      {children}
    </GitHubContext.Provider>
  );
};
