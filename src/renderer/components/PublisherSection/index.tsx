import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { NoAvailableAddonsSection } from 'renderer/components/NoAvailableAddonsSection';
import { AddonSection } from 'renderer/components/AddonSection';
import { useAppSelector } from 'renderer/redux/store';

export const PublisherSection: FC = () => {
  const { publisherName } = useParams<{ publisherName: string }>();
  const publisher = useAppSelector((state) => state.configuration.publishers.find((it) => it.name === publisherName));

  if (!publisher?.addons.length) {
    return <NoAvailableAddonsSection />;
  }

  return <AddonSection />;
};
