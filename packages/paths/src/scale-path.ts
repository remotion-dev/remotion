import {getBoundingBoxFromInstructions} from './get-bounding-box';
import type {Instruction} from './helpers/types';
import {parsePath} from './parse-path';
import {reduceInstructions} from './reduce-instructions';
import {serializeInstructions} from './serialize-instructions';
import {translateSegments} from './translate-path';

/*
 * @description Allows you to grow or shrink the size of a path.
 * @see [Documentation](https://www.remotion.dev/docs/paths/scale-path)
 */
export const scalePath = (d: string, scaleX: number, scaleY: number) => {
	const reduced = reduceInstructions(parsePath(d));

	const bounded = getBoundingBoxFromInstructions(reduced);
	const zeroed = translateSegments(reduced, -bounded.x1, -bounded.y1);

	const mapped = zeroed.map((instruction): Instruction => {
		if (instruction.type === 'L') {
			return {
				type: 'L',
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'C') {
			return {
				type: 'C',
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
				cp1x: scaleX * instruction.cp1x,
				cp1y: scaleY * instruction.cp1y,
				cp2x: scaleX * instruction.cp2x,
				cp2y: scaleY * instruction.cp2y,
			};
		}

		if (instruction.type === 'M') {
			return {
				type: 'M',
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'Q') {
			return {
				type: 'Q',
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
				cpx: scaleX * instruction.cpx,
				cpy: scaleY * instruction.cpy,
			};
		}

		if (instruction.type === 'Z') {
			return {
				type: 'Z',
			};
		}

		if (instruction.type === 'A') {
			return {
				type: 'A',
				largeArcFlag: instruction.largeArcFlag,
				rx: scaleX * instruction.rx,
				ry: scaleY * instruction.ry,
				sweepFlag: instruction.sweepFlag,
				xAxisRotation: instruction.xAxisRotation,
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'H') {
			return {
				type: 'H',
				x: scaleX * instruction.x,
			};
		}

		if (instruction.type === 'S') {
			return {
				type: 'S',
				cpx: scaleX * instruction.cpx,
				cpy: scaleY * instruction.cpy,
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'T') {
			return {
				type: 'T',
				x: scaleX * instruction.x,
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'V') {
			return {
				type: 'V',
				y: scaleY * instruction.y,
			};
		}

		if (instruction.type === 'a') {
			return {
				type: 'a',
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
				largeArcFlag: instruction.largeArcFlag,
				rx: scaleX * instruction.rx,
				ry: scaleY * instruction.ry,
				sweepFlag: instruction.sweepFlag,
				xAxisRotation: instruction.xAxisRotation,
			};
		}

		if (instruction.type === 'c') {
			return {
				type: 'c',
				cp1dx: scaleX * instruction.cp1dx,
				cp1dy: scaleY * instruction.cp1dy,
				cp2dx: scaleX * instruction.cp2dx,
				cp2dy: scaleY * instruction.cp2dy,
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 'h') {
			return {
				type: 'h',
				dx: scaleX * instruction.dx,
			};
		}

		if (instruction.type === 'l') {
			return {
				type: 'l',
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 'm') {
			return {
				type: 'm',
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 'q') {
			return {
				type: 'q',
				cpdx: scaleX * instruction.cpdx,
				cpdy: scaleY * instruction.cpdy,
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 's') {
			return {
				type: 's',
				cpdx: scaleX * instruction.cpdx,
				cpdy: scaleY * instruction.cpdy,
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 't') {
			return {
				type: 't',
				dx: scaleX * instruction.dx,
				dy: scaleY * instruction.dy,
			};
		}

		if (instruction.type === 'v') {
			return {
				type: 'v',
				dy: scaleY * instruction.dy,
			};
		}

		throw new Error('unexpected function');
	});

	return serializeInstructions(
		translateSegments(mapped, bounded.x1, bounded.y1),
	);
};
