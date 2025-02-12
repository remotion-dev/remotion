import React from 'react';
type Value = Record<string, string>;
export declare const PreloadContext: React.Context<Value>;
export declare const setPreloads: (updater: (p: Value) => Value) => void;
export declare const PrefetchProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};
