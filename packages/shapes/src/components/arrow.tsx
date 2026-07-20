import React from 'react';
import {Interactive} from 'remotion';
import type {MakeArrowProps} from '../utils/make-arrow';
import {makeArrow} from '../utils/make-arrow';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {enumField, makeShapeSchema, numberField} from './schema';

export type ArrowProps = MakeArrowProps & AllShapesProps;

const arrowSchema = makeShapeSchema({
	length: numberField({
		defaultValue: 300,
		description: 'Length',
		min: 0,
	}),
	headWidth: numberField({
		defaultValue: 185,
		description: 'Head Width',
		min: 0,
	}),
	headLength: numberField({
		defaultValue: 120,
		description: 'Head Length',
		min: 0,
	}),
	shaftWidth: numberField({
		defaultValue: 80,
		description: 'Shaft Width',
		min: 0,
	}),
	direction: enumField({
		defaultValue: 'right',
		description: 'Direction',
		variants: ['right', 'left', 'up', 'down'],
	}),
	cornerRadius: numberField({
		defaultValue: 0,
		description: 'Corner Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element containing an arrow shape.
 * @param {Number} length The total length of the arrow along its direction axis. Default 300.
 * @param {Number} headWidth The width of the arrowhead at its widest point. Default 185.
 * @param {Number} headLength The length of the arrowhead portion. Default 120.
 * @param {Number} shaftWidth The width of the arrow shaft. Default 80.
 * @param {string} direction The direction the arrow points. Default 'right'.
 * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/arrow)
 */
const ArrowInner: React.FC<ArrowProps> = ({
	length,
	headWidth,
	headLength,
	shaftWidth,
	direction,
	cornerRadius,
	...props
}) => {
	return (
		<RenderSvg
			defaultName="<Arrow>"
			documentationLink="https://www.remotion.dev/docs/shapes/arrow"
			{...makeArrow({
				length,
				headWidth,
				headLength,
				shaftWidth,
				direction,
				cornerRadius,
			})}
			{...props}
		/>
	);
};

export const Arrow = Interactive.withSchema({
	Component: ArrowInner,
	componentName: '<Arrow>',
	componentIdentity: 'dev.remotion.shapes.Arrow',
	schema: arrowSchema,
	supportsEffects: true,
}) as React.FC<ArrowProps>;
