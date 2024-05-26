import {arrayOfLength} from './array-of-length';
import type {Command} from './command';
import {splitCurve} from './split-curve';

/**
 * Interpolate between command objects commandStart and commandEnd segmentCount times.
 * If the types are L, Q, or C then the curves are split as per de Casteljau's algorithm.
 * Otherwise we just copy commandStart segmentCount - 1 times, finally ending with commandEnd.
 *
 * @param {Object} commandStart Command object at the beginning of the segment
 * @param {Object} commandEnd Command object at the end of the segment
 * @param {Number} segmentCount The number of segments to split this into. If only 1
 *   Then [commandEnd] is returned.
 * @return {Object[]} Array of ~segmentCount command objects between commandStart and
 *   commandEnd. (Can be segmentCount+1 objects if commandStart is type M).
 */

// TODO: Delete and replace
export function splitSegment(
	commandStart: Command,
	commandEnd: Command,
	segmentCount: number,
) {
	let segments: Command[] = [];

	// line, quadratic bezier, or cubic bezier
	if (
		commandEnd.type === 'L' ||
		commandEnd.type === 'Q' ||
		commandEnd.type === 'C'
	) {
		if (commandStart.type !== 'Z') {
			segments = segments.concat(
				splitCurve(
					commandStart.x as number,
					commandStart.y as number,
					commandEnd,
					segmentCount,
				),
			);
		}

		// general case - just copy the same point
	} else {
		const copyCommand = {...commandStart};

		// convert M to L
		if (copyCommand.type === 'M') {
			copyCommand.type = 'L';
		}

		segments = segments.concat(
			arrayOfLength(segmentCount - 1, undefined).map(() => copyCommand),
		);
		segments.push(commandEnd);
	}

	return segments;
}
