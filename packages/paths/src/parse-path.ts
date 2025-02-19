// Copied from: https://github.com/rveciana/svg-path-properties

import type {Instruction} from './helpers/types';

const length: {[key in Instruction['type'] | 'z']: number} = {
	a: 7,
	A: 7,
	C: 6,
	c: 6,
	H: 1,
	h: 1,
	L: 2,
	l: 2,
	M: 2,
	m: 2,
	Q: 4,
	q: 4,
	S: 4,
	s: 4,
	T: 2,
	t: 2,
	V: 1,
	v: 1,
	Z: 0,
	z: 0,
};

const chunkExact = (
	array: number[],
	instruction: Instruction['type'],
): number[][] => {
	const chunks: number[][] = [];
	const expectedSize = length[instruction];

	if (array.length % expectedSize !== 0) {
		throw new Error(
			`Expected number of arguments of SVG instruction "${instruction} ${array.join(
				' ',
			)}" to be a multiple of ${expectedSize}`,
		);
	}

	for (let i = 0; i < array.length; i += expectedSize) {
		chunks.push(array.slice(i, i + expectedSize));
	}

	return chunks;
};

const makeInstructions = (
	arr: number[],
	instruction: Instruction['type'],
	cb: (args: number[]) => Instruction,
) => {
	return chunkExact(arr, instruction).map((args) => {
		return cb(args);
	});
};

const segmentRegExp = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
const numberRegExp = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

const parseValues = (
	args: string,
	instructionType: Instruction['type'] | 'z',
) => {
	const numbers = args.match(numberRegExp);
	if (!numbers) {
		if (instructionType === 'Z' || instructionType === 'z') {
			return [];
		}

		throw new Error(
			`Malformed path data: ${instructionType} was expected to have numbers afterwards`,
		);
	}

	const expectedArguments = length[instructionType];
	if (numbers.length % expectedArguments !== 0) {
		throw new Error(
			`Malformed path data: ${instructionType} was expected to have a multiple of ${expectedArguments} numbers, but got "${instructionType} ${numbers.join(
				' ',
			)} instead"`,
		);
	}

	return numbers.map(Number);
};

/*
 * @description Parses an SVG string path into an array of Instruction's.
 * @see [Documentation](https://www.remotion.dev/docs/paths/parse-path)
 */
export const parsePath = (path: string): Instruction[] => {
	if (!path) {
		throw new Error('No path provided');
	}

	const segments = path.match(segmentRegExp);
	if (!segments) {
		throw new Error(`No path elements found in string ${path}`);
	}

	return segments
		.map((segmentString: string): Instruction[] => {
			const command = segmentString.charAt(0) as Instruction['type'] | 'z';
			const args = parseValues(segmentString.substring(1), command);

			// overloaded moveTo
			if (command === 'M' && args.length > 2) {
				const segmentsArray: Instruction[] = [];
				segmentsArray.push({
					type: command,
					x: args[0],
					y: args[1],
				});
				segmentsArray.push(
					...makeInstructions(args.slice(2), 'L', (numbers) => ({
						type: 'L',
						x: numbers[0],
						y: numbers[1],
					})),
				);

				return segmentsArray;
			}

			if (command === 'm' && args.length > 2) {
				const segmentsArray: Instruction[] = [];
				segmentsArray.push({
					type: command,
					dx: args[0],
					dy: args[1],
				});
				segmentsArray.push(
					...makeInstructions(args.slice(2), 'l', (numbers) => ({
						type: 'l',
						dx: numbers[0],
						dy: numbers[1],
					})),
				);

				return segmentsArray;
			}

			if (command === 'Z' || command === 'z') {
				return [
					{
						type: 'Z',
					},
				];
			}

			if (command === 'A') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					rx: numbers[0],
					ry: numbers[1],
					xAxisRotation: numbers[2],
					largeArcFlag: numbers[3] === 1,
					sweepFlag: numbers[4] === 1,
					x: numbers[5],
					y: numbers[6],
				}));
			}

			if (command === 'a') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					rx: numbers[0],
					ry: numbers[1],
					xAxisRotation: numbers[2],
					largeArcFlag: numbers[3] === 1,
					sweepFlag: numbers[4] === 1,
					dx: numbers[5],
					dy: numbers[6],
				}));
			}

			if (command === 'C') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cp1x: numbers[0],
					cp1y: numbers[1],
					cp2x: numbers[2],
					cp2y: numbers[3],
					x: numbers[4],
					y: numbers[5],
				}));
			}

			if (command === 'c') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cp1dx: numbers[0],
					cp1dy: numbers[1],
					cp2dx: numbers[2],
					cp2dy: numbers[3],
					dx: numbers[4],
					dy: numbers[5],
				}));
			}

			if (command === 'S') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cpx: numbers[0],
					cpy: numbers[1],
					x: numbers[2],
					y: numbers[3],
				}));
			}

			if (command === 's') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cpdx: numbers[0],
					cpdy: numbers[1],
					dx: numbers[2],
					dy: numbers[3],
				}));
			}

			if (command === 'H') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					x: numbers[0],
				}));
			}

			if (command === 'h') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					dx: numbers[0],
				}));
			}

			if (command === 'V') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					y: numbers[0],
				}));
			}

			if (command === 'v') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					dy: numbers[0],
				}));
			}

			if (command === 'L') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					x: numbers[0],
					y: numbers[1],
				}));
			}

			if (command === 'M') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					x: numbers[0],
					y: numbers[1],
				}));
			}

			if (command === 'm') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					dx: numbers[0],
					dy: numbers[1],
				}));
			}

			if (command === 'l') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					dx: numbers[0],
					dy: numbers[1],
				}));
			}

			if (command === 'Q') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cpx: numbers[0],
					cpy: numbers[1],
					x: numbers[2],
					y: numbers[3],
				}));
			}

			if (command === 'q') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					cpdx: numbers[0],
					cpdy: numbers[1],
					dx: numbers[2],
					dy: numbers[3],
				}));
			}

			if (command === 'T') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					x: numbers[0],
					y: numbers[1],
				}));
			}

			if (command === 't') {
				return makeInstructions(args, command, (numbers) => ({
					type: command,
					dx: numbers[0],
					dy: numbers[1],
				}));
			}

			throw new Error(`Invalid path element ${segmentString}`);
		}, [])
		.flat(1);
};
