import React from 'react';
import {Interactive} from 'remotion';
import type {MakeCalloutProps} from '../utils/make-callout';
import {makeCallout} from '../utils/make-callout';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {enumField, makeShapeSchema, numberField} from './schema';

export type CalloutProps = MakeCalloutProps & AllShapesProps;

const calloutSchema = makeShapeSchema({
	width: numberField({
		defaultValue: 500,
		description: 'Width',
		min: 1,
	}),
	height: numberField({
		defaultValue: 200,
		description: 'Height',
		min: 1,
	}),
	pointerLength: numberField({
		defaultValue: 40,
		description: 'Pointer Length',
		min: 1,
	}),
	pointerBaseWidth: numberField({
		defaultValue: 60,
		description: 'Pointer Base Width',
		min: 1,
	}),
	pointerPosition: numberField({
		defaultValue: 0.5,
		description: 'Pointer Position',
		min: 0,
		max: 1,
		step: 0.01,
	}),
	pointerDirection: enumField({
		defaultValue: 'down',
		description: 'Pointer Direction',
		variants: ['up', 'down', 'left', 'right'],
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing a callout shape.
 * @param {Number} width The width of the callout body. Default 500.
 * @param {Number} height The height of the callout body. Default 200.
 * @param {Number} pointerLength The length of the pointer. Default 40.
 * @param {Number} pointerBaseWidth The width of the pointer where it meets the body. Default 60.
 * @param {Number} pointerPosition Position of the pointer along its side, from 0 to 1. Default 0.5.
 * @param {string} pointerDirection The direction the pointer points. Default 'down'.
 * @param {null|Number} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/callout)
 */
const CalloutInner: React.FC<CalloutProps> = ({
	width,
	height,
	pointerLength,
	pointerBaseWidth,
	pointerPosition,
	pointerDirection,
	edgeRoundness,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Callout>"
			documentationLink="https://www.remotion.dev/docs/shapes/callout"
			{...makeCallout({
				width,
				height,
				pointerLength,
				pointerBaseWidth,
				pointerPosition,
				pointerDirection,
				edgeRoundness,
				cornerRadius,
			})}
			{...props}
		/>
	);
};

export const Callout = Interactive.withSchema({
	Component: CalloutInner,
	componentName: '<Callout>',
	componentIdentity: 'dev.remotion.shapes.Callout',
	schema: calloutSchema,
	supportsEffects: true,
}) as React.FC<CalloutProps>;
