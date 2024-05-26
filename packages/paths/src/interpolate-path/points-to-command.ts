import type {ReducedInstruction} from '../helpers/types';
import type {Command} from './command';

/**
 * Convert segments represented as points back into a command object
 *
 * @param {Number[][]} points Array of [x,y] points: [start, control1, control2, ..., end]
 *   Represents a segment
 * @return {Object} A command object representing the segment.
 */
export function pointsToCommand(points: number[][]): Command {
	let x2: number | undefined;
	let y2: number | undefined;
	let x1: number | undefined;
	let y1: number | undefined;

	if (points.length === 4) {
		x2 = points[2][0];
		y2 = points[2][1];
	}

	if (points.length >= 3) {
		x1 = points[1][0];
		y1 = points[1][1];
	}

	const x = points[points.length - 1][0];
	const y = points[points.length - 1][1];

	let type: 'C' | 'Q' | 'L' = 'L';

	if (points.length === 4) {
		// start, control1, control2, end
		type = 'C';
	} else if (points.length === 3) {
		// start, control, end
		type = 'Q';
	}

	return {x2, y2, x1, y1, x, y, type};
}

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

		return {
			type: 'Q',
			cpx: x1,
			cpy: y1,
			x,
			y,
		};
	}

	return {
		type: 'L',
		x,
		y,
	};
}
