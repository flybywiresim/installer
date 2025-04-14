import { ReleaseInfo } from 'renderer/utils/AddonData';

export interface DownloadProgress {
  interrupted: boolean;
  totalPercent: number;
  splitPartPercent?: number;
  splitPartIndex?: number;
  splitPartCount?: number;
}

export interface DownloadItem {
  id: string;
  progress: DownloadProgress;
  module: string;
  moduleIndex: number;
  moduleCount: number;
  abortControllerID: number;
}

export type DownloadsState = DownloadItem[];

export interface ReleaseData {
  name: string;
  publishedAt: number;
  htmlUrl: string;
  body: string;
}

export type ReleaseNotesState = ReleaseData[];

export type AddonAndTrackLatestVersionNamesState = { [addonKey: string]: { [trackKey: string]: ReleaseInfo } };
