import React, { forwardRef, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { store, useAppSelector } from 'renderer/redux/store';
import './index.css';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import { useInView } from 'react-intersection-observer';
import { ReleaseData } from 'renderer/redux/types';
import { GitVersions } from '@flybywiresim/api-client';
import { addReleases } from 'renderer/redux/features/releaseNotes';
import { useSetting } from 'renderer/rendererSettings';
import dateFormat from 'dateformat';
import { ArrowUp } from 'react-bootstrap-icons';

interface ReleaseNoteCardProps {
  release: ReleaseData;
  isLatest?: boolean;
}

const ReleaseNoteCard = forwardRef<HTMLDivElement, ReleaseNoteCardProps>(({ release, isLatest }, ref) => {
  let [dateLayout] = useSetting<string>('mainSettings.dateLayout');
  const [useLongDateFormat] = useSetting<boolean>('mainSettings.useLongDateFormat');

  if (useLongDateFormat) {
    dateLayout = dateLayout.replace('mm', 'mmmm').replace(/\//g, ' ');
  }

  return (
    <div ref={ref} className="rounded-lg border-2 border-navy-light p-7">
      <div className="mb-3.5 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-x-4">
          <h1 className="m-0 p-0 text-4xl font-semibold text-white">{release.name}</h1>
          {isLatest && <div className="mt-1 rounded-full bg-cyan/20 px-6 text-2xl font-semibold text-cyan">Latest</div>}
        </div>
        <div className="text-2xl text-white">{dateFormat(new Date(release.publishedAt), dateLayout)}</div>
      </div>
      <ReactMarkdown className="markdown-body-releasenotes" remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
        {release.body ?? ''}
      </ReactMarkdown>
    </div>
  );
});

ReleaseNoteCard.displayName = 'ReleaseNoteCard';

export const ReleaseNotes = ({ addon }: { addon: Addon }): JSX.Element => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const releaseNotes = useAppSelector((state) => state.releaseNotes[addon.key]);
  const [releaseComponent, setReleaseComponent] = useState<JSX.Element>(undefined);
  const releaseNotesRef = useRef<HTMLDivElement>(null);
  const [scrollButtonShown, setScrollButtonShown] = useState(false);

  const handleScrollUp = () => {
    if (releaseNotesRef) {
      releaseNotesRef.current.scroll({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setReleaseComponent(
      <div className="flex flex-col gap-y-7">
        {releaseNotes.map((release, index) => (
          <ReleaseNoteCard
            key={release.name}
            isLatest={index === 0}
            ref={releaseNotes.length - 1 === index ? ref : undefined}
            release={release}
          />
        ))}
      </div>,
    );
  }, [ref, releaseNotes]);

  useEffect(() => {
    if (inView) {
      if (addon.repoOwner && addon.repoName) {
        GitVersions.getReleases(addon.repoOwner, addon.repoName, false, releaseNotes.length, 5).then((res) => {
          const content = res.map((release) => ({
            name: release.name,
            publishedAt: release.publishedAt.getTime(),
            htmlUrl: release.htmlUrl,
            body: release.body,
          }));

          if (content.length) {
            store.dispatch(addReleases({ key: addon.key, releases: content }));
          }
        });
      } else {
        store.dispatch(addReleases({ key: addon.key, releases: [] }));
      }
    }
  }, [addon.key, addon.repoName, addon.repoOwner, inView, releaseNotes.length]);

  useEffect(() => {
    const releaseNotes = releaseNotesRef.current;

    const handleScroll = () => {
      if (releaseNotes) {
        setScrollButtonShown(!!releaseNotes.scrollTop);
      }
    };

    if (releaseNotes) {
      releaseNotes.addEventListener('scroll', handleScroll);
    }

    return () => releaseNotes.removeEventListener('scroll', handleScroll);
  }, []);

  const DummyComponent = () => (
    <div className="flex flex-col gap-y-7">
      {[...Array(10)].map((index) => (
        <div className="rounded-md bg-navy p-7" key={index}>
          <div className="flex flex-row justify-between">
            <h3 className="h-8 w-32 animate-pulse bg-navy-light" />
            <h3 className="h-8 w-48 animate-pulse bg-navy-light" />
          </div>
          <div className="h-64 w-full animate-pulse bg-navy-light" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative w-full">
      {scrollButtonShown && releaseComponent && (
        <div className="absolute inset-0">
          <div
            className="absolute bottom-0 right-0 z-30 m-4 cursor-pointer rounded-md bg-cyan/40 p-4 text-white transition duration-200 hover:bg-cyan/100"
            onClick={handleScrollUp}
          >
            <ArrowUp className="stroke-current" size={20} />
          </div>
        </div>
      )}
      <div className="relative size-full overflow-y-auto p-7" ref={releaseNotesRef}>
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-bold text-white">Release Notes</h2>

          <h2 className="text-white">Stable Version</h2>
        </div>
        {releaseComponent ?? <DummyComponent />}
      </div>
    </div>
  );
};
