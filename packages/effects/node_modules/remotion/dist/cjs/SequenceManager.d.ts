import React from 'react';
import type { TSequence } from './CompositionManager.js';
export type SequenceManagerContext = {
    registerSequence: (seq: TSequence) => void;
    unregisterSequence: (id: string) => void;
    sequences: TSequence[];
};
export declare const SequenceManager: React.Context<SequenceManagerContext>;
export type SequenceVisibilityToggleState = {
    hidden: Record<string, boolean>;
    setHidden: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};
export declare const SequenceVisibilityToggleContext: React.Context<SequenceVisibilityToggleState>;
export declare const SequenceManagerProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
