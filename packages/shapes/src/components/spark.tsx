import React from 'react';
import {Internals} from 'remotion';
import type {MakeSparkProps} from '../utils/make-spark';
import {makeSpark} from '../utils/make-spark';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type SparkProps = MakeSparkProps & AllShapesProps;

const sparkSchema = makeShapeSchema({
	width: numberField({
		defaultValue: 200,
		description: 'Width',
		min: 0,
	}),
	height: numberField({
		defaultValue: 240,
		description: 'Height',
		min: 0,
	}),
	innerRadius: numberField({
		defaultValue: 50,
		description: 'Inner Radius',
		min: 0,
	}),
	points: numberField({
		defaultValue: 4,
		description: 'Points',
		min: 2,
		step: 1,
	}),
	rotation: numberField({
		defaultValue: 0,
		description: 'Rotation',
		step: 0.1,
	}),
	tipRoundness: numberField({
		defaultValue: 0,
		description: 'Tip Roundness',
		min: 0,
	}),
	valleyRoundness: numberField({
		defaultValue: 0,
		description: 'Valley Roundness',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a spark.
 * @param {Number} width The width of the spark.
 * @param {Number} height The height of the spark.
 * @param {Number} innerRadius The radius of the inner spark valleys.
 * @param {Number} points The amount of points of the spark. Default 4.
 * @param {Number} rotation Rotates the spark around its center in radians. Default 0.
 * @param {Number} tipRoundness Rounds the outer tips of the spark. Default 0.
 * @param {Number} valleyRoundness Rounds the inner valleys of the spark. Default 0.
 * @param {null|Number} edgeRoundness Curves the spark edges toward or away from the center. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/spark)
 */
const SparkInner: React.FC<SparkProps> = ({
	width,
	height,
	innerRadius,
	points,
	rotation,
	tipRoundness,
	valleyRoundness,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Spark>"
			documentationLink="https://www.remotion.dev/docs/shapes/spark"
			{...makeSpark({
				width,
				height,
				innerRadius,
				points,
				rotation,
				tipRoundness,
				valleyRoundness,
				edgeRoundness,
			})}
			{...props}
		/>
	);
};

export const Spark = Internals.wrapInSchema({
	Component: SparkInner,
	schema: sparkSchema,
	supportsEffects: true,
}) as React.FC<SparkProps>;

Internals.addSequenceStackTraces(Spark);
