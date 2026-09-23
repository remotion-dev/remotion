import {
	interpolate,
	type ExtrapolateType,
	type InterpolateOptions,
} from 'remotion/no-react';
import {getEndPosition} from './get-end-position';
import type {ReducedInstruction} from './helpers/types';
import {convertToSameInstructionType} from './interpolate-path/convert-to-same-instruction-type';
import {extendInstruction} from './interpolate-path/extend-command';
import {interpolatePath} from './interpolate-path/interpolate-path';
import {parsePath} from './parse-path';
import {reduceInstructions} from './reduce-instructions';
import {serializeInstructions} from './serialize-instructions';

export type InterpolatePathsOptions = Pick<
	InterpolateOptions,
	'easing' | 'posterize'
> & {
	extrapolateLeft?: Exclude<ExtrapolateType, 'identity'>;
	extrapolateRight?: Exclude<ExtrapolateType, 'identity'>;
};

const normalizeInterpolatedPath = (path: string): string => {
	// Remove floating-point artifacts without rounding small coordinates to zero.
	return path.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (value) => {
		const number = Number(value);
		return Number.isInteger(number)
			? value
			: String(Number(number.toPrecision(15)));
	});
};

/*
 * @description Interpolates between multiple SVG paths, with keyframes, easing, and extrapolation.
 * @see [Documentation](https://www.remotion.dev/docs/paths/interpolate-paths)
 */
export const interpolatePaths = (
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options?: InterpolatePathsOptions,
): string => {
	if (!Array.isArray(outputRange)) {
		throw new TypeError('outputRange must be an array of SVG path strings');
	}

	for (const path of outputRange) {
		if (typeof path !== 'string') {
			throw new TypeError('outputRange must contain only SVG path strings');
		}
	}

	for (const side of ['extrapolateLeft', 'extrapolateRight'] as const) {
		const extrapolation = options?.[side];
		if (
			extrapolation !== undefined &&
			extrapolation !== 'extend' &&
			extrapolation !== 'clamp' &&
			extrapolation !== 'wrap'
		) {
			throw new TypeError(
				`${side} must be "extend", "clamp", or "wrap" for interpolatePaths()`,
			);
		}
	}

	// Interpolating a basis vector for each path preserves segment selection,
	// easing overshoot, and the contributions of earlier spring segments.
	const weights = interpolate(
		input,
		inputRange,
		outputRange.map((_, pathIndex) =>
			outputRange.map((__, index) => (index === pathIndex ? 1 : 0)),
		),
		options,
	);
	const exactPathIndex = weights.findIndex(
		(weight, index) =>
			weight === 1 &&
			weights.every((otherWeight, otherIndex) =>
				otherIndex === index ? true : otherWeight === 0,
			),
	);
	if (exactPathIndex !== -1) {
		return outputRange[exactPathIndex];
	}

	const contributingPaths = outputRange
		.map((path, index) => ({path, weight: weights[index]}))
		.filter(({weight}) => weight !== 0);
	if (contributingPaths.length === 2) {
		return normalizeInterpolatedPath(
			interpolatePath(
				contributingPaths[1].weight,
				contributingPaths[0].path,
				contributingPaths[1].path,
			),
		);
	}

	const paths = contributingPaths.map(({path}) => {
		const commands = reduceInstructions(parsePath(path));
		if (commands.length === 0) {
			throw new TypeError(`SVG Path "${path}" is not valid`);
		}

		return commands;
	});
	const closed = paths.every(
		(commands) => commands[commands.length - 1].type === 'Z',
	);
	const openPaths = paths.map((commands) =>
		commands[commands.length - 1].type === 'Z'
			? commands.slice(0, -1)
			: commands,
	);
	const reference = openPaths.reduce((longest, commands) =>
		commands.length > longest.length ? commands : longest,
	);
	const extendedPaths = openPaths.map((commands) =>
		commands.length < reference.length
			? extendInstruction(commands, reference)
			: commands,
	);
	const result: ReducedInstruction[] = reference.map((_, instructionIndex) => {
		const commands = extendedPaths.map((path) => path[instructionIndex]);
		if (commands.some((command) => command.type === 'Z')) {
			if (commands.every((command) => command.type === 'Z')) {
				return {type: 'Z'};
			}

			throw new TypeError(
				'Cannot interpolate SVG paths with different subpath structures',
			);
		}

		// A common cubic command preserves every curve while allowing paths with
		// different instruction types to share the same coordinate interpolation.
		const target =
			commands.find((command) => command.type === 'C') ?? commands[0];
		const normalized = commands.map((command, pathIndex) => {
			if ((command.type === 'M') !== (target.type === 'M')) {
				throw new TypeError(
					'Cannot interpolate SVG paths with different subpath structures',
				);
			}

			return convertToSameInstructionType(
				command,
				target,
				getEndPosition(extendedPaths[pathIndex].slice(0, instructionIndex)),
			);
		});
		const coordinates = normalized.map((command) => {
			if (command.type === 'Z') {
				return [];
			}

			return command.type === 'C'
				? [
						command.x,
						command.y,
						command.cp1x,
						command.cp1y,
						command.cp2x,
						command.cp2y,
					]
				: [command.x, command.y];
		});
		const values = coordinates[0].map((base, coordinateIndex) => {
			const interpolated = coordinates.reduce(
				(value, path, pathIndex) =>
					value +
					(path[coordinateIndex] - base) * contributingPaths[pathIndex].weight,
				base,
			);
			if (Number.isFinite(interpolated)) {
				return interpolated;
			}

			// Opposite large coordinates can overflow when subtracting the base.
			return coordinates.reduce(
				(sum, path, pathIndex) =>
					sum + path[coordinateIndex] * contributingPaths[pathIndex].weight,
				0,
			);
		});
		if (target.type === 'C') {
			return {
				type: 'C',
				x: values[0],
				y: values[1],
				cp1x: values[2],
				cp1y: values[3],
				cp2x: values[4],
				cp2y: values[5],
			};
		}

		return {type: target.type, x: values[0], y: values[1]};
	});
	if (closed) {
		result.push({type: 'Z'});
	}

	return normalizeInterpolatedPath(serializeInstructions(result));
};
