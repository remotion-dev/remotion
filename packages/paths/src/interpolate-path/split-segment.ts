import type {ReducedInstruction} from '../helpers/types';
import {splitCurveInstructions} from './split-curve';

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

export function splitSegmentInstructions(
	commandStart: ReducedInstruction,
	commandEnd: ReducedInstruction,
	segmentCount: number,
) {
	let segments: ReducedInstruction[] = [];

	// line, quadratic bezier, or cubic bezier
	if (commandEnd.type === 'L' || commandEnd.type === 'C') {
		if (commandStart.type !== 'Z') {
			segments = segments.concat(
				splitCurveInstructions(
					commandStart.x as number,
					commandStart.y as number,
					commandEnd,
					segmentCount,
				),
			);
		}

		// general case - just copy the same point
	} else {
		const copyCommand: ReducedInstruction =
			commandStart.type === 'M'
				? {
						type: 'L',
						x: commandStart.x,
						y: commandStart.y,
					}
				: commandStart;

		segments = segments.concat(
			new Array(segmentCount - 1).fill(true).map(() => copyCommand),
		);
		segments.push(commandEnd);
	}

	return segments;
}
