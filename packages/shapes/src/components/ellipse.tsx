import React from 'react';
import {Interactive} from 'remotion';
import type {MakeEllipseOptions} from '../utils/make-ellipse';
import {makeEllipse} from '../utils/make-ellipse';
import type {AllShapesProps} from './render-svg';
import {RenderSvg} from './render-svg';
import {makeShapeSchema, numberField} from './schema';

export type EllipseProps = MakeEllipseOptions & AllShapesProps;

const ellipseSchema = makeShapeSchema({
	rx: numberField({
		defaultValue: 100,
		description: 'X Radius',
		min: 0,
	}),
	ry: numberField({
		defaultValue: 50,
		description: 'Y Radius',
		min: 0,
	}),
});

/**
 * @description Renders an SVG element drawing an ellipse.
 * @param {Number} rx The radius of the ellipse on the X axis.
 * @param {Number} ry The radius of the ellipse on the Y axis.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/ellipse)
 */

const EllipseInner: React.FC<EllipseProps> = ({rx, ry, ...props}) => {
	return (
		<RenderSvg
			defaultName="<Ellipse>"
			documentationLink="https://www.remotion.dev/docs/shapes/ellipse"
			{...makeEllipse({rx, ry})}
			{...props}
		/>
	);
};

export const Ellipse = Interactive.withSchema({
	Component: EllipseInner,
	componentName: '<Ellipse>',
	componentIdentity: 'dev.remotion.shapes.Ellipse',
	schema: ellipseSchema,
	supportsEffects: true,
}) as React.FC<EllipseProps>;
