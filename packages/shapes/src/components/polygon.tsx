import React from 'react';
import {Interactive} from 'remotion';
import type {MakePolygonProps} from '../utils/make-polygon';
import {makePolygon} from '../utils/make-polygon';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type PolygonProps = MakePolygonProps & Omit<AllShapesProps, 'points'>;

const polygonSchema = makeShapeSchema({
	points: numberField({
		defaultValue: 5,
		description: 'Points',
		min: 3,
		step: 1,
	}),
	radius: numberField({
		defaultValue: 100,
		description: 'Radius',
		min: 0,
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

const PolygonInner: React.FC<PolygonProps> = ({
	points,
	radius,
	cornerRadius,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Polygon>"
			documentationLink="https://www.remotion.dev/docs/shapes/polygon"
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

export const Polygon = Interactive.withSchema({
	Component: PolygonInner,
	componentName: '<Polygon>',
	componentIdentity: 'dev.remotion.shapes.Polygon',
	schema: polygonSchema,
	supportsEffects: true,
}) as React.FC<PolygonProps>;
