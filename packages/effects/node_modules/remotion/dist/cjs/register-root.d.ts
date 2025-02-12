import type React from 'react';
export declare const registerRoot: (comp: React.FC) => void;
export declare const getRoot: () => React.FC<{}> | null;
export declare const waitForRoot: (fn: (comp: React.FC) => void) => (() => void);
