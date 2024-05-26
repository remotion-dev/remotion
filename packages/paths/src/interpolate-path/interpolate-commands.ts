import {typeMap, type Command} from './command';
import {convertToSameType} from './convert-to-same-type';
import {extend} from './extend-command';

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
export function interpolatePathCommands(
	aCommandsInput: Command[],
	bCommandsInput: Command[],
) {
	// make a copy so we don't mess with the input arrays
	let aCommands =
		aCommandsInput === null || aCommandsInput === undefined
			? []
			: aCommandsInput.slice();
	let bCommands =
		bCommandsInput === null || bCommandsInput === undefined
			? []
			: bCommandsInput.slice();

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
			aCommands = extend(aCommands, bCommands);

			// else if A has more points than B, add more points to B
		} else if (bCommands.length < aCommands.length) {
			bCommands = extend(bCommands, aCommands);
		}
	}

	// commands have same length now.
	// convert commands in A to the same type as those in B
	aCommands = aCommands.map((aCommand, i) =>
		convertToSameType(aCommand, bCommands[i]),
	);

	// create mutable interpolated command objects
	const interpolatedCommands = aCommands.map((aCommand) => ({...aCommand}));

	if (addZ) {
		interpolatedCommands.push({type: 'Z'});
		aCommands.push({type: 'Z'}); // required for when returning at t == 0
	}

	return function (t: number) {
		// at 1 return the final value without the extensions used during interpolation
		if (t === 1) {
			return bCommandsInput === null || bCommandsInput === undefined
				? []
				: bCommandsInput;
		}

		// work with aCommands directly since interpolatedCommands are mutated
		if (t === 0) {
			return aCommands;
		}

		// interpolate the commands using the mutable interpolated command objs
		for (let i = 0; i < interpolatedCommands.length; ++i) {
			// if (interpolatedCommands[i].type === 'Z') continue;

			const aCommand = aCommands[i];
			const bCommand = bCommands[i];
			const interpolatedCommand = interpolatedCommands[i];
			for (const arg of typeMap[
				interpolatedCommand.type as keyof typeof typeMap
			]) {
				// @ts-expect-error
				interpolatedCommand[arg] =
					(1 - t) * (aCommand[arg as keyof Command] as number) +
					t * (bCommand[arg as keyof Command] as number);

				// do not use floats for flags (#27), round to integer
				if (arg === 'largeArcFlag' || arg === 'sweepFlag') {
					// @ts-expect-error
					interpolatedCommand[arg] = Math.round(interpolatedCommand[arg]);
				}
			}
		}

		return interpolatedCommands;
	};
}
