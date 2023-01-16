import React from 'react';
import type {MakeRectOptions} from '../make-rect';
import {makeRect} from '../make-rect';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type RectProps = MakeRectOptions & AllShapesProps;

export const Rect: React.FC<RectProps> = ({width, height, ...props}) => {
	return (
		<RenderSvg
			height={height}
			width={width}
			path={makeRect({
				width,
				height,
			})}
			{...props}
		/>
	);
};
