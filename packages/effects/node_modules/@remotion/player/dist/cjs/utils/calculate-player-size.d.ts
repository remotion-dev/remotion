import type { StandardLonghandProperties } from 'csstype';
import type { Size } from './use-element-size.js';
export declare const calculatePlayerSize: ({ currentSize, width, height, compositionWidth, compositionHeight, }: {
    currentSize: Size | null;
    width: StandardLonghandProperties["width"] | undefined;
    height: StandardLonghandProperties["height"] | undefined;
    compositionWidth: number;
    compositionHeight: number;
}) => React.CSSProperties;
