// Copied partially from https://github.com/michaelrhodes/translate-svg-path/blob/master/index.js
import type {Instruction} from './helpers/types';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

export const translateSegments = (
	segments: Instruction[],
	x: number,
	y: number,
) => {
	return segments.map((segment): Instruction => {
		// Shift coords only for commands with absolute values
		if (
			segment.type === 'a' ||
			segment.type === 'c' ||
			segment.type === 'v' ||
			segment.type === 's' ||
			segment.type === 'h' ||
			segment.type === 'l' ||
			segment.type === 'm' ||
			segment.type === 'q' ||
			segment.type === 't'
		) {
			return segment;
		}

		// V is the only command, with shifted coords parity
		if (segment.type === 'V') {
			return {
				type: 'V',
				y: segment.y + y,
			};
		}

		if (segment.type === 'H') {
			return {
				type: 'H',
				x: segment.x + x,
			};
		}

		// ARC is: ['A', rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y]
		// touch x, y only
		if (segment.type === 'A') {
			return {
				type: 'A',
				rx: segment.rx,
				ry: segment.ry,
				largeArcFlag: segment.largeArcFlag,
				sweepFlag: segment.sweepFlag,
				xAxisRotation: segment.xAxisRotation,
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'Z') {
			return segment;
		}

		if (segment.type === 'C') {
			return {
				type: 'C',
				cp1x: segment.cp1x + x,
				cp1y: segment.cp1y + y,
				cp2x: segment.cp2x + x,
				cp2y: segment.cp2y + y,
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'Q') {
			return {
				type: 'Q',
				cpx: segment.cpx + x,
				cpy: segment.cpy + y,
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'S') {
			return {
				type: 'S',
				cpx: segment.cpx + x,
				cpy: segment.cpy + y,
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'T') {
			return {
				type: 'T',
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'L') {
			return {
				type: 'L',
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		if (segment.type === 'M') {
			return {
				type: 'M',
				x: segment.x + x,
				y: segment.y + y,
			};
		}

		// @ts-expect-error
		throw new Error(`Unknown segment type: ${segment.type}`);
	});
};

/*
 * @description Translates the path by the given x and y coordinates.
 * @see [Documentation](https://www.remotion.dev/docs/paths/translate-path)
 */
export const translatePath = (path: string, x: number, y: number) => {
	return serializeInstructions(translateSegments(parsePath(path), x, y));
};
