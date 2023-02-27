import type {AbsoluteInstruction, Instruction} from './helpers/types';
import {parsePath} from './parse-path';
import {serializeInstructions} from './serialize-instructions';

/**
 * @description Removes all relative coordinates from an SVG path and converts them into absolute coordinates.
 * @param {string} path A valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/normalize-path)
 */
export const normalizePath = (path: string): string => {
	const instructions = parsePath(path);
	const normalized = normalizeInstructions(instructions);
	return serializeInstructions(normalized);
};

export const normalizeInstructions = (
	instructions: Instruction[]
): AbsoluteInstruction[] => {
	// Extended properties must already be normalized
	const normalized: AbsoluteInstruction[] = [];

	let x = 0;
	let y = 0;
	const initialX = 0;
	const initialY = 0;

	for (let i = 0; i < instructions.length; i++) {
		const instruction = instructions[i];
		if (
			instruction.type === 'A' ||
			instruction.type === 'C' ||
			instruction.type === 'L' ||
			instruction.type === 'M' ||
			instruction.type === 'Q' ||
			instruction.type === 'S' ||
			instruction.type === 'T'
		) {
			normalized.push(instruction);
			x = instruction.x;
			y = instruction.y;
			continue;
		}

		if (
			instruction.type === 'a' ||
			instruction.type === 'c' ||
			instruction.type === 'l' ||
			instruction.type === 'm' ||
			instruction.type === 'q' ||
			instruction.type === 's' ||
			instruction.type === 't'
		) {
			x += instruction.dx;
			y += instruction.dy;
			if (instruction.type === 'a') {
				normalized.push({
					type: 'A',
					largeArcFlag: instruction.largeArcFlag,
					rx: instruction.rx,
					ry: instruction.ry,
					sweepFlag: instruction.sweepFlag,
					xAxisRotation: instruction.xAxisRotation,
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 'c') {
				normalized.push({
					type: 'C',
					cp1x: instruction.cp1dx + x,
					cp1y: instruction.cp1dy + y,
					cp2x: instruction.cp2dx + x,
					cp2y: instruction.cp2dy + y,
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 'l') {
				normalized.push({
					type: 'L',
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 'm') {
				normalized.push({
					type: 'M',
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 'q') {
				normalized.push({
					type: 'Q',
					cpx: instruction.cpdx + x,
					cpy: instruction.cpdy + y,
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 's') {
				normalized.push({
					type: 'S',
					cpx: instruction.cpdx + x,
					cpy: instruction.cpdy + y,
					x,
					y,
				});
				continue;
			}

			if (instruction.type === 't') {
				normalized.push({
					type: 'T',
					x,
					y,
				});
				continue;
			}
		}

		if (instruction.type === 'H') {
			normalized.push(instruction);
			x = instruction.x;
			continue;
		}

		if (instruction.type === 'V') {
			normalized.push(instruction);
			y = instruction.y;
			continue;
		}

		if (instruction.type === 'Z') {
			normalized.push(instruction);
			x = initialX;
			y = initialY;
			continue;
		}

		if (instruction.type === 'h') {
			x += instruction.dx;
			normalized.push({
				type: 'H',
				x,
			});
			continue;
		}

		if (instruction.type === 'v') {
			y += instruction.dy;
			normalized.push({
				type: 'V',
				y,
			});
			continue;
		}

		// @ts-expect-error
		throw new Error('Unknown instruction type: ' + instruction.type);
	}

	return normalized;
};
