import React, { FC } from "react";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { NoAvailableAddonsSection } from "renderer/components/NoAvailableAddonsSection";
import { useAppSelector } from "renderer/redux/store";
import { AddonSectionNew } from "../AddonSectionNew";
import { AircraftSectionURLParams } from "renderer/components/AddonSection";

export const PublisherSection: FC = () => {
    const { publisherKey } = useParams<AircraftSectionURLParams>();
    const publisher = useAppSelector((state) => state.configuration.publishers.find((it) => it.key === publisherKey));

    if (!publisher?.addons.some((it) => it.enabled)) {
        return <NoAvailableAddonsSection />;
    }

    return (
        <Switch>
            <Route exact path="/addon-section/:publisherKey">
                <Redirect to={`/addon-section/${publisherKey}/${publisher.addons[0].key}`} />
            </Route>

            <Route path="/addon-section/:publisherKey/:addonKey">
                <AddonSectionNew />
            </Route>
        </Switch>
    );
};
