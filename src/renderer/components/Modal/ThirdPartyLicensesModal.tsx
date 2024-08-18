import React, { useCallback } from 'react';
import { X } from 'react-bootstrap-icons';
import { useModals } from 'renderer/components/Modal/index';

import thirdPartyLicensesFile from '../../../../.github/LICENSES.yaml';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVirtualizer } from '@tanstack/react-virtual';

export const ThirdPartyLicensesModal: React.FC = () => {
  type Licenses = Record<string, LicenseEntry>;

  interface LicenseEntry {
    licenses: string;
    repository: string;
    text: string;
  }

  const { popModal } = useModals();

  const handleClose = () => {
    popModal();
  };

  const licenses: Licenses = thirdPartyLicensesFile;
  const licenseEntries = Object.entries(licenses);

  // The scrollable element for your list
  const parentRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    count: Object.keys(licenses).length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 800, []),
  });

  return (
    <div className="flex size-2/3 max-w-screen-sm flex-col rounded-xl border-2 border-navy-light bg-navy p-8 text-quasi-white">
      <div className="flex w-full flex-row items-start justify-between">
        <h2 className="font-bold leading-none text-quasi-white">{'Third Party Licenses'}</h2>
        <div className="" onClick={handleClose}>
          <X className="-m-14.06px text-red-600 hover:text-red-500" size={50} strokeWidth={1} />
        </div>
      </div>
      <div ref={parentRef} className="mt-4 w-full grow overflow-y-scroll">
        <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((item) => {
            const [key, entry] = licenseEntries[item.index];

            return (
              <div
                ref={item.measureElement}
                key={item.key}
                className="absolute left-0 top-0 w-full"
                style={{
                  transform: `translateY(${item.start}px)`,
                }}
                data-index={item.index}
              >
                <div>
                  <h5 className="font-mono">{key}</h5>

                  <a
                    target="_blank"
                    className="text-2xl text-cyan hover:text-cyan-medium"
                    href={entry.repository}
                    rel="noreferrer"
                  >
                    {entry.repository}
                  </a>

                  <ReactMarkdown
                    className="markdown-body-modal mt-4 border-l-2 border-gray-500 pl-6"
                    remarkPlugins={[remarkGfm]}
                    linkTarget={'_blank'}
                  >
                    {entry.text}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
