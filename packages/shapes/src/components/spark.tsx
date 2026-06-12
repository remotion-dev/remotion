import React from 'react';
import {Internals} from 'remotion';
import type {MakeSparkProps} from '../utils/make-spark';
import {makeSpark} from '../utils/make-spark';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type SparkProps = MakeSparkProps & AllShapesProps;

const sparkSchema = makeShapeSchema({
	innerRadius: numberField({
		defaultValue: 50,
		description: 'Inner Radius',
		min: 0,
	}),
	outerRadius: numberField({
		defaultValue: 100,
		description: 'Outer Radius',
		min: 0,
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a spark.
 * @param {Number} innerRadius The inner radius of the spark.
 * @param {Number} outerRadius The outer radius of the spark.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/spark)
 */
const SparkInner: React.FC<SparkProps> = ({
	innerRadius,
	outerRadius,
	cornerRadius,
	edgeRoundness,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Spark>"
			documentationLink="https://www.remotion.dev/docs/shapes/spark"
			{...makeSpark({
				innerRadius,
				outerRadius,
				cornerRadius,
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
