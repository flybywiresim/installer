import React, { FC } from "react";
import { PublisherSidebar } from "renderer/components/AddonSectionNew/PublisherSidebar";
import { AddonContent } from "renderer/components/AddonSectionNew/AddonContent";

export const AddonSectionNew: FC = () => {

    return (
        <div className="flex flex-row w-full h-full">
            <PublisherSidebar />

            <AddonContent />
        </div>
    );
};
