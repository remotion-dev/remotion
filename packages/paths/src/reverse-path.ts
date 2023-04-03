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

function reverseNormalizedPath(instructions: Instruction[]) {
	const reversed: unknown[] = [];

	for (const term of instructions) {
		if (term.type === 'A') {
			reversed.unshift(term.sweepFlag ? '0' : '1');
			reversed.unshift(term.largeArcFlag ? '1' : '0');
			reversed.unshift(term.xAxisRotation);
			reversed.unshift(term.ry);
			reversed.unshift(term.rx);
		} else if (term.type === 'C') {
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
