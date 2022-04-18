import React, { FC } from "react";

export interface AircraftCardProps {
    name: string,
}

export const AircraftCard: FC<AircraftCardProps> = ({ name }) => {
    return (
        <div className="w-96 bg-navy-light rounded-lg p-5">
            <span className="text-3xl font-manrope font-semibold">{name}</span>
        </div>
    );
};
