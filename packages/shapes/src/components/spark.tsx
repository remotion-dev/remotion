import React from 'react';
import {Interactive} from 'remotion';
import type {MakeSparkProps} from '../utils/make-spark';
import {makeSpark} from '../utils/make-spark';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type SparkProps = MakeSparkProps & AllShapesProps;

const sparkSchema = makeShapeSchema({
	width: numberField({
		defaultValue: 100,
		description: 'Width',
		min: 0,
	}),
	height: numberField({
		defaultValue: 140,
		description: 'Height',
		min: 0,
	}),
	edgeRoundness: numberField({
		defaultValue: 1,
		description: 'Edge Roundness',
		min: 0,
		step: 0.01,
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a spark.
 * @param {Number} width The width of the spark.
 * @param {Number} height The height of the spark.
 * @param {Number} edgeRoundness Controls the inward curvature between the points. Default 1.
 * @param {Number} cornerRadius Rounds the four points. Default 0.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/spark)
 */
const SparkInner: React.FC<SparkProps> = ({
	width,
	height,
	edgeRoundness,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Spark>"
			documentationLink="https://www.remotion.dev/docs/shapes/spark"
			{...makeSpark({width, height, edgeRoundness, cornerRadius})}
			{...props}
		/>
	);
};

export const Spark = Interactive.withSchema({
	Component: SparkInner,
	componentName: '<Spark>',
	componentIdentity: 'dev.remotion.shapes.Spark',
	schema: sparkSchema,
	supportsEffects: true,
}) as React.FC<SparkProps>;
