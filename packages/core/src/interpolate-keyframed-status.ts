import {bezier} from './bezier.js';
import {Easing} from './easing.js';
import {interpolateColors} from './interpolate-colors.js';
import type {EasingFunction} from './interpolate.js';
import {interpolate} from './interpolate.js';
import type {
	CanUpdateSequencePropStatusEasing,
	CanUpdateSequencePropStatusKeyframed,
} from './use-schema.js';

const easingToFn = (e: CanUpdateSequencePropStatusEasing): EasingFunction => {
	if (e === 'linear') {
		return Easing.linear;
	}

	return bezier(e[0], e[1], e[2], e[3]);
};

export const interpolateKeyframedStatus = ({
	frame,
	status,
}: {
	frame: number;
	status: CanUpdateSequencePropStatusKeyframed;
}): number | string | null => {
	const {keyframes, easing, clamping, interpolationFunction} = status;
	if (keyframes.length === 0) {
		return null;
	}

	const posterizedFrame =
		status.posterize === undefined
			? frame
			: Math.floor(frame / status.posterize) * status.posterize;
	const inputRange = keyframes.map((k) => k.frame);
	const outputs = keyframes.map((k) => k.value);

	if (interpolationFunction === 'interpolateColors') {
		if (!outputs.every((v) => typeof v === 'string')) {
			return null;
		}

		if (keyframes.length === 1) {
			return outputs[0] as string;
		}

		try {
			return interpolateColors(
				posterizedFrame,
				inputRange,
				outputs as string[],
			);
		} catch {
			return null;
		}
	}

	if (interpolationFunction !== 'interpolate') {
		return null;
	}

	if (!outputs.every((v) => typeof v === 'number')) {
		return null;
	}

	if (keyframes.length === 1) {
		return outputs[0] as number;
	}

	try {
		return interpolate(posterizedFrame, inputRange, outputs as number[], {
			easing: easing.map(easingToFn),
			extrapolateLeft: clamping.left,
			extrapolateRight: clamping.right,
		});
	} catch {
		return null;
	}
};
