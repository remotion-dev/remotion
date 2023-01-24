// Copied partially from https://github.com/michaelrhodes/translate-svg-path/blob/master/index.js
import type {Instruction} from './helpers/parse';
import {parsePath} from './helpers/parse';

const serialize = (path: (Instruction | number[])[]) => {
	return path.reduce((str: string, seg: Instruction | number[]) => {
		return (str + ' ' + seg[0] + ' ' + seg.slice(1).join(',')).trim();
	}, '');
};

const translateSegments = (path: string, x: number, y: number) => {
	const segments = parsePath(path);

	return segments.map((segment) => {
		const cmd = segment[0];

		// Shift coords only for commands with absolute values
		if ('ACHLMRQSTVZ'.indexOf(cmd) === -1) {
			return segment;
		}

		const name = cmd.toLowerCase();

		// V is the only command, with shifted coords parity
		if (name === 'v') {
			segment[1] = (segment[1] as number) + (y as number);
			return segment;
		}

		// ARC is: ['A', rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y]
		// touch x, y only
		if (name === 'a') {
			segment[6] = (segment[6] as number) + x;
			segment[7] = (segment[7] as number) + (y ?? 0);
			return segment;
		}

		// All other commands have [cmd, x1, y1, x2, y2, x3, y3, ...] format
		return segment.map((val, i) => {
			if (!i) {
				return val as number;
			}

			return i % 2 ? (val as number) + x : (val as number) + (y ?? 0);
		});
	});
};

export const translatePath = (path: string, x: number, y: number) => {
	return serialize(translateSegments(path, x, y));
};
