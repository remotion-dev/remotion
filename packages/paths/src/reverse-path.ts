/**
 * https://github.com/Pomax/svg-path-reverse
 *
 * This code is in the public domain, except in jurisdictions that do
 * not recognise the public domain, where this code is MIT licensed.
 */

import {constructFromInstructions} from './helpers/construct';
import type {Instruction} from './helpers/types';
import {normalizeInstructions} from './normalize-path';
import {parsePath} from './parse-path';
import {reduceInstructions} from './reduce-instructions';

/**
 * Normalise an SVG path to absolute coordinates
 * and full commands, rather than relative coordinates
 * and/or shortcut commands.
 */

/**
 * Reverse an SVG path.
 * As long as the input path is normalised, this is actually really
 * simple to do. As all pathing commands are symmetrical, meaning
 * that they render the same when you reverse the coordinate order,
 * the grand trick here is to reverse the path (making sure to keep
 * coordinates ordered pairwise) and shift the operators left by
 * one or two coordinate pairs depending on the operator:
 *
 *   - Z is removed (after noting it existed),
 *   - L moves to 2 spots earlier (skipping one coordinate),
 *   - Q moves to 2 spots earlier (skipping one coordinate),
 *   - C moves to 4 spots earlier (skipping two coordinates)
 *       and its arguments get reversed,
 *   - the path start becomes M.
 *   - the path end becomes Z iff it was there to begin with.
 */
function reverseNormalizedPath(instructions: Instruction[]) {
	const reversed: unknown[] = [];

	for (let t = 0; t < instructions.length; t++) {
		const term = instructions[t];

		if (term.type === 'A') {
			reversed.push(term.sweepFlag ? '0' : '1');
			reversed.push(term.largeArcFlag ? '1' : '0');
			reversed.push(term.xAxisRotation);
			reversed.push(term.ry);
			reversed.push(term.rx);
		}

		// how many coordinate pairs do we need to read,
		// and by how many pairs should this operator be
		// shifted left?
		else if (term.type === 'C') {
			reversed.unshift(term.cp1y);
			reversed.unshift(term.cp1x);
			reversed.unshift(term.cp2y);
			reversed.unshift(term.cp2x);
		} else if (term.type === 'Q') {
			reversed.unshift(term.cpy);
			reversed.unshift(term.cpx);
		} else if (term.type === 'L') {
			// Do nothing
		} else if (term.type === 'M') {
			// Do nothing
		} else {
			throw new Error('unnormalized instruction ' + term.type);
		}

		reversed.unshift(term.type);
		reversed.unshift(term.y);
		reversed.unshift(term.x);
	}

	reversed.unshift('M');

	// generating the reversed path string involves
	// running through our transformed terms in reverse.
	let revstring = '';
	for (let r = 0; r < reversed.length - 1; r++) {
		revstring += reversed[r] + ' ';
	}

	if (instructions[instructions.length - 1].type === 'Z') revstring += 'Z';
	revstring = revstring.replace(/M M/g, 'Z M');

	return revstring;
}

/**
 * @description Reverses a path so the end and start are switched.
 * @param {string} path A valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/reverse-path)
 */
export const reversePath = (path: string) => {
	const parsed = parsePath(path);
	const normalized = normalizeInstructions(parsed);
	const reduced = reduceInstructions(normalized);

	const {segments} = constructFromInstructions(reduced);

	return segments
		.map((spath) => {
			return reverseNormalizedPath(spath);
		})
		.join(' ')
		.replace(/ +/g, ' ')
		.trim();
};
