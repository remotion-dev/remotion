import React from 'react';
import type {MakeHeartProps} from '../utils/make-heart';
import {makeHeart} from '../utils/make-heart';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type HeartProps = MakeHeartProps & AllShapesProps;

/**
 * @description Renders an SVG element containing a heart.
 * @param {Number} width The width of the heart.
 * @param {Number} height The height of the heart.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/heart)
 */

export const Heart: React.FC<HeartProps> = ({
	width,
	height,
	...props
}) => {
	return (
		<RenderSvg
			{...makeHeart({
				width,
				height,
			})}
			{...props}
		/>
	);
};