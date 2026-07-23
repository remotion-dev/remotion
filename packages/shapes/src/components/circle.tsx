import React from 'react';
import {Interactive} from 'remotion';
import type {MakeCircleProps} from '../utils/make-circle';
import {makeCircle} from '../utils/make-circle';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type CircleProps = MakeCircleProps & AllShapesProps;

const circleSchema = makeShapeSchema({
	radius: numberField({
		defaultValue: 100,
		description: 'Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element drawing a circle.
 * @param {Number} radius The radius of the circle.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/circle)
 */
const CircleInner: React.FC<CircleProps> = ({radius, ...props}) => {
	return (
		<RenderSvg
			defaultName="<Circle>"
			documentationLink="https://www.remotion.dev/docs/shapes/circle"
			{...makeCircle({radius})}
			{...props}
		/>
	);
};

export const Circle = Interactive.withSchema({
	Component: CircleInner,
	componentName: '<Circle>',
	componentIdentity: 'dev.remotion.shapes.Circle',
	schema: circleSchema,
	supportsEffects: true,
}) as React.FC<CircleProps>;
