import {getEndPosition} from '../get-end-position';
import type {ReducedInstruction} from '../helpers/types';
import {convertToSameInstructionType} from './convert-to-same-instruction-type';
import {extendInstruction} from './extend-command';
import {interpolateInstructionOfSameKind} from './interpolate-instruction-of-same-kind';

/**
 * Interpolate from A to B by extending A and B during interpolation to have
 * the same number of points. This allows for a smooth transition when they
 * have a different number of points.
 *
 * Ignores the `Z` command in paths unless both A and B end with it.
 *
 * This function works directly with arrays of command objects instead of with
 * path `d` strings (see interpolatePath for working with `d` strings).
 *
 * @param {Object[]} aCommandsInput Array of path commands
 * @param {Object[]} bCommandsInput Array of path commands
 * @returns {Function} Interpolation function that maps t ([0, 1]) to an array of path commands.
 */
export function interpolateInstructions(
	aCommandsInput: ReducedInstruction[],
	bCommandsInput: ReducedInstruction[],
) {
	// make a copy so we don't mess with the input arrays
	let aCommands = aCommandsInput.slice();
	let bCommands = bCommandsInput.slice();

	// both input sets are empty, so we don't interpolate
	if (!aCommands.length && !bCommands.length) {
		return function () {
			return [];
		};
	}

	// do we add Z during interpolation? yes if both have it. (we'd expect both to have it or not)
	const addZ =
		(aCommands.length === 0 || aCommands[aCommands.length - 1].type === 'Z') &&
		(bCommands.length === 0 || bCommands[bCommands.length - 1].type === 'Z');

	// we temporarily remove Z
	if (aCommands.length > 0 && aCommands[aCommands.length - 1].type === 'Z') {
		aCommands.pop();
	}

	if (bCommands.length > 0 && bCommands[bCommands.length - 1].type === 'Z') {
		bCommands.pop();
	}

	// if A is empty, treat it as if it used to contain just the first point
	// of B. This makes it so the line extends out of from that first point.
	if (!aCommands.length) {
		aCommands.push(bCommands[0]);

		// otherwise if B is empty, treat it as if it contains the first point
		// of A. This makes it so the line retracts into the first point.
	} else if (!bCommands.length) {
		bCommands.push(aCommands[0]);
	}

	// extend to match equal size
	const numPointsToExtend = Math.abs(bCommands.length - aCommands.length);

	if (numPointsToExtend !== 0) {
		// B has more points than A, so add points to A before interpolating
		if (bCommands.length > aCommands.length) {
			aCommands = extendInstruction(aCommands, bCommands);

			// else if A has more points than B, add more points to B
		} else if (bCommands.length < aCommands.length) {
			bCommands = extendInstruction(bCommands, aCommands);
		}
	}

	// commands have same length now.
	// convert commands in A to the same type as those in B
	const aSameType = aCommands.map((aCommand, i) => {
		const commandsUntilNow = aCommands.slice(0, i);
		const point = getEndPosition(commandsUntilNow);
		return convertToSameInstructionType(aCommand, bCommands[i], point);
	});

	const interpolatedCommands: ReducedInstruction[] = [];

	if (addZ) {
		aSameType.push({type: 'Z'}); // required for when returning at t == 0
		bCommands.push({type: 'Z'});
	}

	return function (t: number) {
		// at 1 return the final value without the extensions used during interpolation
		if (t === 1) {
			return bCommandsInput;
		}

		// work with aCommands directly since interpolatedCommands are mutated
		if (t === 0) {
			return aSameType;
		}

		// interpolate the commands using the mutable interpolated command objs
		for (let i = 0; i < aSameType.length; ++i) {
			interpolatedCommands.push(
				interpolateInstructionOfSameKind(t, aSameType[i], bCommands[i]),
			);
		}

		return interpolatedCommands;
	};
}
