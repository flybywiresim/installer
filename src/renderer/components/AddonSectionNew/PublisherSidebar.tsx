import React, { FC } from "react";
import { AddonBar, AddonBarItem } from "renderer/components/App/AddonBar";
import { AddonCategoryDefinition } from "renderer/utils/InstallerConfiguration";
import { useDataContext } from "renderer/utils/DataContext";
import { useHistory } from "react-router-dom";

export const PublisherSidebar: FC = () => {
    const history = useHistory();
    const { publisher, addon: selectedAddon } = useDataContext();

    if (!publisher) {
        return null;
    }

    return (
        <div
            className="flex-none bg-navy-medium z-40 h-full"
            style={{ width: "31rem" }}
        >
            <div className="h-full flex flex-col divide-y divide-gray-700">
                <AddonBar>
                    <div className="flex flex-col gap-y-4">
                        {publisher.addons.filter((it) => !it.category).map((addon) => (
                            <AddonBarItem
                                selected={selectedAddon?.key === addon.key && addon.enabled}
                                enabled={addon.enabled || !!addon.hidesAddon}
                                addon={addon}
                                key={addon.key}
                                onClick={() => {
                                    history.push(`/addon-section/${publisher.key}/${addon.key}`);
                                }}
                            />
                        ))}
                    </div>

                    <div className="h-full flex flex-col gap-y-4">
                        {publisher.defs?.filter((it) => it.kind === 'addonCategory').map((category: AddonCategoryDefinition) => {
                            const categoryAddons = publisher.addons.filter((it) => it.category?.substring(1) === category.key);

                            if (categoryAddons.length === 0) {
                                return null;
                            }

                            let classes = '';
                            if (category.styles?.includes('align-bottom')) {
                                classes += 'mt-auto';
                            }

                            return (
                                <div className={classes}>
                                    <h4 className="text-quasi-white font-manrope font-medium">{category.title}</h4>

                                    <div className="flex flex-col gap-y-4">
                                        {publisher.addons.filter((it) => it.category?.substring(1) === category.key).map((addon) => (
                                            <AddonBarItem
                                                selected={selectedAddon?.key === addon.key && addon.enabled}
                                                enabled={addon.enabled || !!addon.hidesAddon}
                                                addon={addon}
                                                key={addon.key}
                                                onClick={() => {
                                                    history.push(`/addon-section/${publisher.key}/${addon.key}`);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </AddonBar>
            </div>
        </div>
    );
};
