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

import type {Command} from './helpers/split-curve';
import {splitCurve, typeMap} from './helpers/split-curve';

const commandTokenRegex = /[MLCSTQAHVZmlcstqahv]|-?[\d.e+-]+/g;

function arrayOfLength<T>(length: number, value: T): T[] {
	const array = Array(length);
	for (let i = 0; i < length; i++) {
		array[i] = value;
	}

	return array;
}

/**
 * Converts a command object to a string to be used in a `d` attribute
 * @param {Object} command A command object
 * @return {String} The string for the `d` attribute
 */
function commandToString(command: Command) {
	return `${command.type} ${typeMap[command.type]
		.map((p) => command[p as keyof Command])
		.join(' ')}`;
}

/**
 * Converts command A to have the same type as command B.
 *
 * e.g., L0,5 -> C0,5,0,5,0,5
 *
 * Uses these rules:
 * x1 <- x
 * x2 <- x
 * y1 <- y
 * y2 <- y
 * rx <- 0
 * ry <- 0
 * xAxisRotation <- read from B
 * largeArcFlag <- read from B
 * sweepflag <- read from B
 *
 * @param {Object} aCommand Command object from path `d` attribute
 * @param {Object} bCommand Command object from path `d` attribute to match against
 * @return {Object} aCommand converted to type of bCommand
 */
function convertToSameType(aCommand: Command, bCommand: Command) {
	const conversionMap = {
		x1: 'x',
		y1: 'y',
		x2: 'x',
		y2: 'y',
	} as const;

	const readFromBKeys = ['xAxisRotation', 'largeArcFlag', 'sweepFlag'];

	// convert (but ignore M types)
	if (aCommand.type !== bCommand.type && bCommand.type.toUpperCase() !== 'M') {
		const aConverted: Command = {
			type: bCommand.type,
		};
		Object.keys(bCommand).forEach((bKey) => {
			const bValue = bCommand[bKey as keyof Command];
			// first read from the A command
			let aValue = aCommand[bKey as keyof Command];

			// if it is one of these values, read from B no matter what
			if (aValue === undefined) {
				if (readFromBKeys.includes(bKey)) {
					aValue = bValue;
				} else {
					// if it wasn't in the A command, see if an equivalent was
					if (
						aValue === undefined &&
						conversionMap[bKey as keyof typeof conversionMap]
					) {
						aValue =
							aCommand[conversionMap[bKey as keyof typeof conversionMap]];
					}

					// if it doesn't have a converted value, use 0
					if (aValue === undefined) {
						aValue = 0;
					}
				}
			}

			// @ts-expect-error
			aConverted[bKey as keyof Command] = aValue;
		});

		// update the type to match B
		aConverted.type = bCommand.type;
		aCommand = aConverted;
	}

	return aCommand;
}

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
function splitSegment(
	commandStart: Command,
	commandEnd: Command,
	segmentCount: number
) {
	let segments: Command[] = [];

	// line, quadratic bezier, or cubic bezier
	if (
		commandEnd.type === 'L' ||
		commandEnd.type === 'Q' ||
		commandEnd.type === 'C'
	) {
		segments = segments.concat(
			splitCurve(commandStart, commandEnd, segmentCount)
		);

		// general case - just copy the same point
	} else {
		const copyCommand = {...commandStart};

		// convert M to L
		if (copyCommand.type === 'M') {
			copyCommand.type = 'L';
		}

		segments = segments.concat(
			arrayOfLength(segmentCount - 1, undefined).map(() => copyCommand)
		);
		segments.push(commandEnd);
	}

	return segments;
}

/**
 * Extends an array of commandsToExtend to the length of the referenceCommands by
 * splitting segments until the number of commands match. Ensures all the actual
 * points of commandsToExtend are in the extended array.
 *
 * @param {Object[]} commandsToExtend The command object array to extend
 * @param {Object[]} referenceCommands The command object array to match in length
 * @return {Object[]} The extended commandsToExtend array
 */
function extend(commandsToExtend: Command[], referenceCommands: Command[]) {
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
	const countPointsPerSegment = arrayOfLength<undefined>(
		numReferenceSegments,
		undefined
	).reduce((accum, _d, i) => {
		const insertIndex = Math.floor(segmentRatio * i);

		accum[insertIndex] = (accum[insertIndex] || 0) + 1;

		return accum;
	}, [] as (undefined | number)[]);

	// extend each segment to have the correct number of points for a smooth interpolation
	const extended = countPointsPerSegment.reduce(
		(_extended, segmentCount, i) => {
			// if last command, just add `segmentCount` number of times
			if (i === commandsToExtend.length - 1) {
				const lastCommandCopies = arrayOfLength(segmentCount as number, {
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
				splitSegment(
					commandsToExtend[i],
					commandsToExtend[i + 1],
					segmentCount as number
				)
			);
		},
		[] as Command[]
	);

	// add in the very first point since splitSegment only adds in the ones after it
	extended.unshift(commandsToExtend[0]);

	return extended;
}

/**
 * Takes a path `d` string and converts it into an array of command
 * objects. Drops the `Z` character.
 *
 * @param {String|null} d A path `d` string
 */
function pathCommandsFromString(d: string | null) {
	// split into valid tokens
	const tokens = (d || '').match(commandTokenRegex) || [];
	const commands = [];
	let commandArgs: string[];
	let command: Command;

	// iterate over each token, checking if we are at a new command
	// by presence in the typeMap
	for (let i = 0; i < tokens.length; ++i) {
		commandArgs = typeMap[tokens[i] as keyof typeof typeMap];

		// new command found:
		if (commandArgs) {
			command = {
				type: tokens[i] as Command['type'],
			};

			// add each of the expected args for this command:
			for (let a = 0; a < commandArgs.length; ++a) {
				// @ts-expect-error
				command[commandArgs[a] as keyof Command] = Number(tokens[i + a + 1]);
			}

			// need to increment our token index appropriately since
			// we consumed token args
			i += commandArgs.length;

			commands.push(command);
		}
	}

	return commands;
}

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
	bCommandsInput: Command[]
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
		convertToSameType(aCommand, bCommands[i])
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
 * Interpolate from A to B by extending A and B during interpolation to have
 * the same number of points. This allows for a smooth transition when they
 * have a different number of points.
 *
 * Ignores the `Z` character in paths unless both A and B end with it.
 *
 * @param {String} a The `d` attribute for a path
 * @param {String} b The `d` attribute for a path
 * @returns {Function} Interpolation function that maps t ([0, 1]) to a path `d` string.
 */
export const interpolatePath = (value: number, a: string, b: string) => {
	// at 1 return the final value without the extensions used during interpolation
	if (value === 1) {
		return b;
	}

	if (value === 0) {
		return a;
	}

	const aCommands = pathCommandsFromString(a);
	if (aCommands.length === 0) {
		throw new TypeError(`SVG Path "${a}" is not valid`);
	}

	const bCommands = pathCommandsFromString(b);
	if (bCommands.length === 0) {
		throw new TypeError(`SVG Path "${b}" is not valid`);
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
