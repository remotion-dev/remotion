import type { ThreeDReducedInstruction } from '@remotion/svg-3d-engine';
import React from 'react';
export type FaceSVGProps = {
    readonly strokeLinecap?: React.SVGAttributes<SVGPathElement>['strokeLinecap'];
    readonly strokeMiterlimit?: React.SVGAttributes<SVGPathElement>['strokeMiterlimit'];
};
export declare const Face: React.FC<{
    readonly points: ThreeDReducedInstruction[];
    readonly color: string;
    readonly strokeColor: string;
    readonly strokeWidth: number;
    readonly crispEdges: boolean;
} & FaceSVGProps>;
