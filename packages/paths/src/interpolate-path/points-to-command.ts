import {convertQToCInstruction} from '../helpers/convert-q-to-c-instruction';
import type {ReducedInstruction} from '../helpers/types';

/**
 * Convert segments represented as points back into a command object
 *
 * @param {Number[][]} points Array of [x,y] points: [start, control1, control2, ..., end]
 *   Represents a segment
 * @return {Object} A command object representing the segment.
 */
export function pointsToInstruction(points: number[][]): ReducedInstruction {
	const x = points[points.length - 1][0];
	const y = points[points.length - 1][1];

	if (points.length === 4) {
		const x1 = points[1][0];
		const y1 = points[1][1];
		const x2 = points[2][0];
		const y2 = points[2][1];

		return {
			type: 'C',
			cp1x: x1,
			cp1y: y1,
			cp2x: x2,
			cp2y: y2,
			x,
			y,
		};
	}

	if (points.length === 3) {
		const x1 = points[1][0];
		const y1 = points[1][1];

		return convertQToCInstruction(
			{
				type: 'Q',
				cpx: x1,
				cpy: y1,
				x,
				y,
			},
			{
				x: points[0][0],
				y: points[0][1],
			},
		);
	}

	return {
		type: 'L',
		x,
		y,
	};
}
