import type {ReducedInstruction} from '../helpers/types';
import {splitSegmentInstructions} from './split-segment';

/**
 * Extends an array of commandsToExtend to the length of the referenceCommands by
 * splitting segments until the number of commands match. Ensures all the actual
 * points of commandsToExtend are in the extended array.
 *
 * @param {Object[]} commandsToExtend The command object array to extend
 * @param {Object[]} referenceCommands The command object array to match in length
 * @return {Object[]} The extended commandsToExtend array
 */
export function extendInstruction(
	commandsToExtend: ReducedInstruction[],
	referenceCommands: ReducedInstruction[],
) {
	// compute insertion points:
	// number of segments in the path to extend
	const numSegmentsToExtend = commandsToExtend.length - 1;

	// number of segments in the reference path.
	const numReferenceSegments = referenceCommands.length - 1;

	// this value is always between [0, 1].
	const segmentRatio = numSegmentsToExtend / numReferenceSegments;

	// create a map, mapping segments in referenceCommands to how many points
	// should be added in that segment (should always be >= 1 since we need each
	// point itself).
	// 0 = segment 0-1, 1 = segment 1-2, n-1 = last vertex
	const countPointsPerSegment = new Array(numReferenceSegments)
		.fill(undefined)
		.reduce(
			(accum, _d, i) => {
				const insertIndex = Math.floor(segmentRatio * i);

				accum[insertIndex] = (accum[insertIndex] || 0) + 1;

				return accum;
			},
			[] as (undefined | number)[],
		) as number[];

	// extend each segment to have the correct number of points for a smooth interpolation
	const extended = countPointsPerSegment.reduce(
		(_extended, segmentCount, i) => {
			// if last command, just add `segmentCount` number of times
			if (i === commandsToExtend.length - 1) {
				const lastCommandCopies = new Array(segmentCount as number).fill({
					...commandsToExtend[commandsToExtend.length - 1],
				});

				// convert M to L
				if (lastCommandCopies[0].type === 'M') {
					lastCommandCopies.forEach((d) => {
						d.type = 'L';
					});
				}

				return _extended.concat(lastCommandCopies);
			}

			// otherwise, split the segment segmentCount times.
			return _extended.concat(
				splitSegmentInstructions(
					commandsToExtend[i],
					commandsToExtend[i + 1],
					segmentCount as number,
				),
			);
		},
		[] as ReducedInstruction[],
	);

	// add in the very first point since splitSegment only adds in the ones after it
	extended.unshift(commandsToExtend[0]);

	return extended;
}
