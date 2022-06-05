import React, { FC, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ConfigurationAspect } from "renderer/utils/InstallerConfiguration";
import { YesNoOptionToggle } from "renderer/components/AddonSection/Configure/YesNoOptionToggle";

export interface ConfigurationAspectDisplayProps {
    aspect: ConfigurationAspect,
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
            <h2 className="flex justify-between items-center text-white font-bold mb-2">
                {aspect.title}
            </h2>
            <div className="flex flex-row gap-x-8">
                {/* noop */}
                {aspect.choiceKind === 'yesNo' && (
                    <YesNoOptionToggle enabled={on} onToggle={() => setOn(old => !old)} downloadSize={'287.5 MB'} />
                )}
            </div>
            {chosen && chosen.description &&
                <div className="mt-10">
                    <h2 className="text-white font-bold">Description</h2>
                    <p className="text-xl text-white font-manrope leading-relaxed">
                        <ReactMarkdown
                            className="text-xl text-white font-light font-manrope leading-relaxed"
                            children={chosen.description}
                            linkTarget={"_blank"}
                        />
                    </p>
                </div>
            }
        </div>
    );
};
