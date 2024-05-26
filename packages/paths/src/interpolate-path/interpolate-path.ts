/*

Copied and adapted from https://github.com/pbeshai/d3-interpolate-path:
Copyright 2016, Peter Beshai
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

import {typeMap, type Command} from './command';
import {commandToString} from './command-to-string';
import {convertToSameType} from './convert-to-same-type';
import {extend} from './extend-command';
import {pathCommandsFromString} from './path-commands-from-string';

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
function interpolatePathCommands(
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

/**
 * @description Interpolates between two SVG paths.
 * @param {number} value A number - 0 means first path, 1 means second path, any other values will be interpolated
 * @param {string} firstPath The first valid SVG path
 * @param {string} secondPath The second valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/interpolate-path)
 */
export const interpolatePath = (
	value: number,
	firstPath: string,
	secondPath: string,
) => {
	// at 1 return the final value without the extensions used during interpolation
	if (value === 1) {
		return secondPath;
	}

	if (value === 0) {
		return firstPath;
	}

	const aCommands = pathCommandsFromString(firstPath);
	if (aCommands.length === 0) {
		throw new TypeError(`SVG Path "${firstPath}" is not valid`);
	}

	const bCommands = pathCommandsFromString(secondPath);
	if (bCommands.length === 0) {
		throw new TypeError(`SVG Path "${secondPath}" is not valid`);
	}

	const commandInterpolator = interpolatePathCommands(aCommands, bCommands);

	const interpolatedCommands = commandInterpolator(value);

	// convert to a string (fastest concat: https://jsperf.com/join-concat/150)

	return interpolatedCommands
		.map((c) => {
			return commandToString(c);
		})
		.join(' ');
};
