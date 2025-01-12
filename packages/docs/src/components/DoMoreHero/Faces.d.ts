import type { ThreeDElement } from '@remotion/svg-3d-engine/src/elements';
import React from 'react';
import type { FaceSVGProps } from './Face';
export declare const Faces: React.FC<{
    readonly elements: ThreeDElement[];
    readonly noSort?: boolean;
} & FaceSVGProps>;
