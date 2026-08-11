import React from 'react';
import {Interactive} from 'remotion';
import type {MakePieProps} from '../utils/make-pie';
import {makePie} from '../utils/make-pie';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {booleanField, makeShapeSchema, numberField} from './schema';

export type PieProps = MakePieProps & AllShapesProps;

const pieSchema = makeShapeSchema({
	radius: numberField({
		defaultValue: 100,
		description: 'Radius',
		min: 0,
	}),
	progress: numberField({
		defaultValue: 0.5,
		description: 'Progress',
		max: 1,
		min: 0,
		step: 0.01,
	}),
	closePath: booleanField({
		defaultValue: true,
		description: 'Close Path',
	}),
	counterClockwise: booleanField({
		defaultValue: false,
		description: 'Counter Clockwise',
	}),
	rotation: numberField({
		defaultValue: 0,
		description: 'Rotation',
		step: 0.01,
	}),
});

/**
 * @description Renders an SVG element drawing a pie piece.
 * @param {Number} radius The radius of the circle..
 * @param {Number} progress The percentage of the circle that is filled. 0 means fully empty, 1 means fully filled.
 * @param {Boolean} closePath If set to false, no path to the middle of the circle will be drawn, leading to an open arc. Default true.
 * @param {Boolean} counterClockwise If set, the circle gets filled counterclockwise instead of clockwise. Default false.
 * @param {Number} rotation Add rotation to the path. 0 means no rotation, Math.PI * 2 means 1 full clockwise rotation
 * @see [Documentation](https://www.remotion.dev/docs/shapes/pie)
 */

const PieInner: React.FC<PieProps> = ({
	radius,
	progress,
	closePath,
	counterClockwise,
	rotation,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Pie>"
			documentationLink="https://www.remotion.dev/docs/shapes/pie"
			{...makePie({radius, progress, closePath, counterClockwise, rotation})}
			{...props}
		/>
	);
};

export const Pie = Interactive.withSchema({
	Component: PieInner,
	componentName: '<Pie>',
	componentIdentity: 'dev.remotion.shapes.Pie',
	schema: pieSchema,
	supportsEffects: true,
}) as React.FC<PieProps>;
