import React from 'react';
import type {MakePolygonProps} from '../utils/make-polygon';
import {makePolygon} from '../utils/make-polygon';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';

export type PolygonProps = MakePolygonProps & Omit<AllShapesProps, 'points'>;

export const Polygon: React.FC<PolygonProps> = ({
	points,
	radius,
	cornerRadius,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			{...makePolygon({
				points,
				cornerRadius,
				edgeRoundness,
				radius,
			})}
			{...props}
		/>
	);
};
