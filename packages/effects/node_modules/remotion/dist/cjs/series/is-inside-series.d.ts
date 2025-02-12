import React from 'react';
export declare const IsInsideSeriesContext: React.Context<boolean>;
export declare const IsInsideSeriesContainer: React.FC<{
    readonly children: React.ReactNode;
}>;
export declare const IsNotInsideSeriesProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export declare const useRequireToBeInsideSeries: () => void;
