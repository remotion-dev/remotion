import {bezier} from './bezier.js';
import {Easing} from './easing.js';
import {interpolateColors} from './interpolate-colors.js';
import type {EasingFunction} from './interpolate.js';
import {interpolate} from './interpolate.js';
import type {
	CanUpdateSequencePropStatusEasing,
	CanUpdateSequencePropStatusKeyframed,
} from './use-schema.js';

type InterpolateKeyframedStatusResult =
	| number
	| string
	| readonly number[]
	| null;

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
			outputs as (number | string | number[])[],
			{
				easing: easing.map((e) =>
					easingToFn({easing: e, forceSpringAllowTail}),
				),
				extrapolateLeft: clamping.left,
				extrapolateRight: clamping.right,
				posterize: status.posterize,
			},
		);
	} catch {
		return null;
	}
};
