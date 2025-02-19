import type {Instruction} from '@remotion/paths';
import {serializeInstructions} from '@remotion/paths';
import {joinPoints} from './join-points';
import type {ShapeInfo} from './shape-info';

export type MakeRectOptions = {
	width: number;
	height: number;
	edgeRoundness?: number | null;
	cornerRadius?: number;
};

/**
 * @description Generates an SVG rectangle.
 * @param {Number} width The width of the rectangle.
 * @param {Number} height The height of the rectangle
 * @param {Number | null} edgeRoundness Allows to modify the shape by rounding the edges using bezier curves. Default null.
 * @param {Number} cornerRadius  * @param {Number} cornerRadius Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.
 * @see [Documentation](https://www.remotion.dev/docs/shapes/make-rect)
 */
export const makeRect = ({
	width,
	height,
	edgeRoundness = null,
	cornerRadius = 0,
}: MakeRectOptions): ShapeInfo => {
	const transformOrigin: [number, number] = [width / 2, height / 2];
	const instructions: Instruction[] = [
		...joinPoints(
			[
				[cornerRadius, 0],
				[width, 0],
				[width, height],
				[0, height],
				[0, 0],
			],
			{edgeRoundness, cornerRadius, roundCornerStrategy: 'arc'},
		),
		{
			type: 'Z',
		},
	];
	const path = serializeInstructions(instructions);

	return {
		width,
		height,
		instructions,
		path,
		transformOrigin: transformOrigin.join(' '),
	};
};
