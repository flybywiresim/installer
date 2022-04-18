import React, { FC } from "react";
import { AircraftCard } from "./AircraftCard";

export const FsltlSection: FC = () => (
    <div className="w-full px-6 py-7 text-quasi-white">
        <h2 className="text-quasi-white font-bold -mb-1">FSLTL</h2>

        <div className="flex gap-x-5">
            <AircraftCard name="A330-900" />
            <AircraftCard name="A330-900" />
            <AircraftCard name="A330-900" />
            <AircraftCard name="A330-900" />
        </div>
    </div>
);
