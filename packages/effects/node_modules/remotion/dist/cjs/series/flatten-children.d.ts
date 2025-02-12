import React from 'react';
type ReactChildArray = ReturnType<typeof React.Children.toArray>;
export declare const flattenChildren: (children: React.ReactNode) => ReactChildArray;
export {};
