import {bezier} from './bezier.js';
import {Easing} from './easing.js';
import {interpolateColors} from './interpolate-colors.js';
import type {EasingFunction} from './interpolate.js';
import {interpolate} from './interpolate.js';
import type {ScaleValue} from './scale-value.js';
import {parseValidScaleValue, serializeScaleValue} from './scale-value.js';
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

const isScaleValue = (value: ScaleValue | null): value is ScaleValue => {
	return value !== null;
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
			return interpolateColors(frame, inputRange, outputs as string[], {
				posterize: status.posterize,
			});
		} catch {
			return null;
		}
	}

	if (interpolationFunction !== 'interpolate') {
		return null;
	}

	if (!outputs.every((v) => typeof v === 'number')) {
		const scaleValues = outputs.map(parseValidScaleValue);
		if (!scaleValues.every(isScaleValue)) {
			return null;
		}

		if (keyframes.length === 1) {
			return serializeScaleValue(scaleValues[0]);
		}

		try {
			return serializeScaleValue([
				interpolate(
					frame,
					inputRange,
					scaleValues.map((scaleValue) => scaleValue[0]),
					{
						easing: easing.map(easingToFn),
						extrapolateLeft: clamping.left,
						extrapolateRight: clamping.right,
						posterize: status.posterize,
					},
				),
				interpolate(
					frame,
					inputRange,
					scaleValues.map((scaleValue) => scaleValue[1]),
					{
						easing: easing.map(easingToFn),
						extrapolateLeft: clamping.left,
						extrapolateRight: clamping.right,
						posterize: status.posterize,
					},
				),
				interpolate(
					frame,
					inputRange,
					scaleValues.map((scaleValue) => scaleValue[2]),
					{
						easing: easing.map(easingToFn),
						extrapolateLeft: clamping.left,
						extrapolateRight: clamping.right,
						posterize: status.posterize,
					},
				),
			]);
		} catch {
			return null;
		}
	}

	if (keyframes.length === 1) {
		return outputs[0] as number;
	}

	try {
		return interpolate(frame, inputRange, outputs as number[], {
			easing: easing.map(easingToFn),
			extrapolateLeft: clamping.left,
			extrapolateRight: clamping.right,
			posterize: status.posterize,
		});
	} catch {
		return null;
	}
};
