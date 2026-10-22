import {bezier} from './bezier.js';
import {Easing} from './easing.js';
import {interpolateColors} from './interpolate-colors.js';
import type {
	EasingFunction,
	ExtrapolateType,
	InterpolateOptions,
} from './interpolate.js';
import {interpolate, prepareNumericInterpolation} from './interpolate.js';
import type {
	CanUpdateSequencePropStatusEasing,
	CanUpdateSequencePropStatusKeyframed,
} from './use-schema.js';

type InterpolateKeyframedStatusResult =
	| number
	| string
	| boolean
	| readonly number[]
	| null;

type PathInterpolator = (
	input: number,
	inputRange: readonly number[],
	outputRange: readonly string[],
	options: Pick<InterpolateOptions, 'easing' | 'posterize'> & {
		extrapolateLeft: Exclude<ExtrapolateType, 'identity'>;
		extrapolateRight: Exclude<ExtrapolateType, 'identity'>;
	},
) => string;

// Studio supplies the path interpolator to avoid a dependency from remotion
// to @remotion/paths, which itself uses remotion's interpolation timing.
let interpolatePaths: PathInterpolator | null = null;

export const setInterpolatePaths = (interpolator: PathInterpolator): void => {
	interpolatePaths = interpolator;
};

const easingToFn = ({
	easing,
	forceSpringAllowTail,
}: {
	easing: CanUpdateSequencePropStatusEasing;
	forceSpringAllowTail: boolean | null;
}): EasingFunction => {
	switch (easing.type) {
		case 'linear':
			return Easing.linear;
		case 'step1':
			return Easing.step1;
		case 'spring':
			return Easing.spring({
				allowTail: forceSpringAllowTail ?? easing.allowTail ?? undefined,
				damping: easing.damping,
				durationRestThreshold: easing.durationRestThreshold ?? undefined,
				mass: easing.mass,
				overshootClamping: easing.overshootClamping,
				stiffness: easing.stiffness,
			});
		case 'bezier':
			return bezier(easing.x1, easing.y1, easing.x2, easing.y2);
		default:
			throw new TypeError(
				`Unsupported easing: ${JSON.stringify(easing satisfies never)}`,
			);
	}
};

export const prepareNumericKeyframedStatus = ({
	forceSpringAllowTail,
	status,
}: {
	forceSpringAllowTail: boolean | null;
	status: CanUpdateSequencePropStatusKeyframed;
}): ((frame: number) => number | null) | null => {
	if (
		status.interpolationFunction !== 'interpolate' ||
		status.keyframes.length === 0
	) {
		return null;
	}

	const sortedKeyframes = [...status.keyframes].sort(
		(a, b) => a.frame - b.frame,
	);
	const inputRange = sortedKeyframes.map((keyframe) => keyframe.frame);
	const outputRange = sortedKeyframes.map((keyframe) => keyframe.value);
	if (
		!outputRange.every((value): value is number => typeof value === 'number')
	) {
		return null;
	}

	try {
		const evaluate = prepareNumericInterpolation({
			inputRange,
			outputRange,
			options: {
				easing: status.easing.map((easing) =>
					easingToFn({easing, forceSpringAllowTail}),
				),
				extrapolateLeft: status.clamping.left,
				extrapolateRight: status.clamping.right,
				output: status.output,
				posterize: status.posterize,
			},
		});
		return (frame) => {
			try {
				return evaluate(frame);
			} catch {
				return null;
			}
		};
	} catch {
		return null;
	}
};

export const interpolateKeyframedStatus = ({
	frame,
	forceSpringAllowTail,
	status,
}: {
	frame: number;
	forceSpringAllowTail: boolean | null;
	status: CanUpdateSequencePropStatusKeyframed;
}): InterpolateKeyframedStatusResult => {
	const {keyframes, easing, clamping, interpolationFunction} = status;
	if (keyframes.length === 0) {
		return null;
	}

	const sortedKeyframes = [...keyframes].sort((a, b) => a.frame - b.frame);
	const inputRange = sortedKeyframes.map((k) => k.frame);
	const outputs = sortedKeyframes.map((k) => k.value);

	if (interpolationFunction === 'interpolatePaths') {
		if (!outputs.every((v): v is string => typeof v === 'string')) {
			return null;
		}

		if (keyframes.length === 1) {
			return outputs[0];
		}

		if (
			!interpolatePaths ||
			clamping.left === 'identity' ||
			clamping.right === 'identity'
		) {
			return null;
		}

		try {
			return interpolatePaths(frame, inputRange, outputs, {
				easing: easing.map((e) =>
					easingToFn({easing: e, forceSpringAllowTail}),
				),
				extrapolateLeft: clamping.left,
				extrapolateRight: clamping.right,
				posterize: status.posterize,
			});
		} catch {
			return null;
		}
	}

	if (interpolationFunction === 'interpolateColors') {
		if (!outputs.every((v) => typeof v === 'string')) {
			return null;
		}

		if (keyframes.length === 1) {
			return outputs[0] as string;
		}

		try {
			return interpolateColors(frame, inputRange, outputs as string[], {
				easing: easing.map((e) =>
					easingToFn({easing: e, forceSpringAllowTail}),
				),
				posterize: status.posterize,
			});
		} catch {
			return null;
		}
	}

	if (interpolationFunction !== 'interpolate') {
		return null;
	}

	try {
		return interpolate(
			frame,
			inputRange,
			outputs as (number | string | boolean | number[])[],
			{
				easing: easing.map((e) =>
					easingToFn({easing: e, forceSpringAllowTail}),
				),
				extrapolateLeft: clamping.left,
				extrapolateRight: clamping.right,
				output: status.output,
				posterize: status.posterize,
			},
		);
	} catch {
		return null;
	}
};
