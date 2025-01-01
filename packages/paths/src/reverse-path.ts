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
import {serializeInstructions} from './serialize-instructions';

function reverseNormalizedPath(instructions: Instruction[]) {
	const reversed: Instruction[] = [];

	let nextX = 0;
	let nextY = 0;

	for (const term of instructions) {
		if (term.type === 'A') {
			reversed.unshift({
				type: 'A',
				largeArcFlag: term.largeArcFlag,
				rx: term.rx,
				ry: term.ry,
				xAxisRotation: term.xAxisRotation,
				sweepFlag: !term.sweepFlag,
				x: nextX,
				y: nextY,
			});
		} else if (term.type === 'C') {
			reversed.unshift({
				type: 'C',
				cp1x: term.cp2x,
				cp1y: term.cp2y,
				cp2x: term.cp1x,
				cp2y: term.cp1y,
				x: nextX,
				y: nextY,
			});
		} else if (term.type === 'Q') {
			reversed.unshift({
				type: 'Q',
				cpx: term.cpx,
				cpy: term.cpy,
				x: nextX,
				y: nextY,
			});
		} else if (term.type === 'L') {
			reversed.unshift({
				type: 'L',
				x: nextX,
				y: nextY,
			});
			// Do nothing
		} else if (term.type === 'M') {
			// Do nothing
		} else if (term.type === 'Z') {
			// Do nothing
		} else {
			throw new Error('unnormalized instruction ' + term.type);
		}

		if (term.type !== 'Z') {
			nextX = term.x;
			nextY = term.y;
		}
	}

	reversed.unshift({
		type: 'M',
		x: nextX,
		y: nextY,
	});

	let revstring = serializeInstructions(reversed);

	if (instructions[instructions.length - 1].type === 'Z') revstring += 'Z';
	revstring = revstring.replace(/M M/g, 'Z M');

	return revstring;
}

/*
 * @description Reverses a path so the end and start are switched.
 * @see [Documentation](https://www.remotion.dev/docs/paths/reverse-path)
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
