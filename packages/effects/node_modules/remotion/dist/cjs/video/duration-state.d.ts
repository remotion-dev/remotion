import React from 'react';
type DurationState = Record<string, number>;
type DurationAction = {
    type: 'got-duration';
    src: string;
    durationInSeconds: number;
};
export declare const durationReducer: (state: DurationState, action: DurationAction) => DurationState;
type TDurationsContext = {
    durations: DurationState;
    setDurations: React.Dispatch<DurationAction>;
};
export declare const DurationsContext: React.Context<TDurationsContext>;
export declare const DurationsContextProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};
