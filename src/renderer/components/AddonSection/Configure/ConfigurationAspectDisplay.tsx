import React, { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ConfigurationAspect } from 'renderer/utils/InstallerConfiguration';
import { YesNoOptionToggle } from 'renderer/components/AddonSection/Configure/YesNoOptionToggle';

export interface ConfigurationAspectDisplayProps {
  aspect: ConfigurationAspect;
}

export const ConfigurationAspectDisplay: FC<ConfigurationAspectDisplayProps> = ({ aspect }) => {
  const [on, setOn] = useState(false);

  if (!aspect?.choices) {
    throw new Error('Invalid configuration aspect: choices array is falsy.');
  } else if (aspect.choices?.length === 0) {
    throw new Error('Invalid configuration aspect: 0 choices.');
  }

  const chosen = aspect.choices[0];

  return (
    <div>
      <h2 className="mb-2 flex items-center justify-between font-bold text-white">{aspect.title}</h2>
      <div className="flex flex-row gap-x-8">
        {/* noop */}
        {aspect.choiceKind === 'yesNo' && (
          <YesNoOptionToggle enabled={on} onToggle={() => setOn((old) => !old)} downloadSize={'287.5 MB'} />
        )}
      </div>
      {chosen && chosen.description && (
        <div className="mt-10">
          <h2 className="font-bold text-white">Description</h2>
          <p className="font-manrope text-xl leading-relaxed text-white">
            <ReactMarkdown className="font-manrope text-xl font-light leading-relaxed text-white" linkTarget={'_blank'}>
              {chosen.description}
            </ReactMarkdown>
          </p>
        </div>
      )}
    </div>
  );
};
