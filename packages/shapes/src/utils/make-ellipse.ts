import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import type {ShapeInfo} from './shape-info';

export type MakeEllipseOptions = {
	rx: number;
	ry: number;
};

/**
 * @description Generates an ellipse SVG path.
 * @param {Number} rx The radius of the ellipse on the X axis.
 * @param {Number} ry The radius of the ellipse on the Y axis.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-ellipse)
 */

export const makeEllipse = ({rx, ry}: MakeEllipseOptions): ShapeInfo => {
	if (!Number.isFinite(rx) || rx < 0) {
		throw new Error(`"rx" must be a non-negative number, got ${rx}`);
	}

	if (!Number.isFinite(ry) || ry < 0) {
		throw new Error(`"ry" must be a non-negative number, got ${ry}`);
	}

	const instructions: Instruction[] = [
		{
			type: 'M',
			x: rx,
			y: 0,
		},
		{
			type: 'a',
			rx,
			ry,
			xAxisRotation: 0,
			largeArcFlag: true,
			sweepFlag: false,
			dx: 1,
			dy: 0,
		},
		{
			type: 'Z',
		},
	];

	const path = serializeInstructions(instructions);

	return {
		width: rx * 2,
		height: ry * 2,
		path,
		instructions,
		transformOrigin: `${rx} ${ry}`,
	};
};
