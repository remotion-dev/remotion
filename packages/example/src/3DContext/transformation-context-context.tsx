import {type MatrixTransform4D, scaled} from '@remotion/svg-3d-engine';
import React from 'react';

export const TransformContext = React.createContext<MatrixTransform4D>(
	scaled(1),
);
export const CenterPointContext = React.createContext<
	[number, number, number, number]
>([0, 0, 0, 1]);
