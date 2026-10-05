import type {
	CanUpdateSequencePropSource,
	CanUpdateSequencePropStatus,
	SourceNumericValue,
} from './use-schema.js';
import type {VideoConfigValues} from './video-config.js';

export const evaluateSourceNumericValue = (
	expression: SourceNumericValue,
	config: VideoConfigValues | null,
): number => {
	if (typeof expression === 'number') {
		return expression;
	}

	if (expression.type === 'literal') {
		return expression.value;
	}

	if (expression.type === 'binary') {
		const left = evaluateSourceNumericValue(expression.left, config);
		const right = evaluateSourceNumericValue(expression.right, config);
		switch (expression.operator) {
			case '+':
				return left + right;
			case '-':
				return left - right;
			case '*':
				return left * right;
			case '/':
				return left / right;
			default:
				throw new Error('Unknown source expression operator');
		}
	}

	const value =
		expression.binding.type === 'constant'
			? expression.binding.value
			: (config?.[expression.binding.field] ?? NaN);
	if (expression.type === 'video-config-multiplication') {
		return value * expression.multiplier;
	}

	if (expression.type === 'video-config-subtraction') {
		return value - expression.subtrahend;
	}

	return value;
};

const evaluatedProps = new WeakMap<
	Record<string, CanUpdateSequencePropSource>,
	Map<string, Record<string, CanUpdateSequencePropStatus>>
>();

/** Resolve at the consumer, never in the shared source subscription cache. */
export const evaluateSourcePropStatuses = (
	props: Record<string, CanUpdateSequencePropSource>,
	config: VideoConfigValues | null,
): Record<string, CanUpdateSequencePropStatus> => {
	const configKey =
		config === null
			? ''
			: `${config.durationInFrames}:${config.fps}:${config.width}:${config.height}`;
	const cached =
		evaluatedProps.get(props) ??
		new Map<string, Record<string, CanUpdateSequencePropStatus>>();
	const existing = cached.get(configKey);
	if (existing) return existing;
	const result: Record<string, CanUpdateSequencePropStatus> =
		Object.fromEntries(
			Object.entries(props).map(([key, status]) => {
				if (status.status === 'computed') {
					return [key, status];
				}

				const adjustment =
					status.keyframeDisplayOffsetAdjustment === null
						? null
						: evaluateSourceNumericValue(
								status.keyframeDisplayOffsetAdjustment,
								config,
							);
				const rate = evaluateSourceNumericValue(
					status.keyframePlaybackRateAdjustment ?? 1,
					config,
				);
				if (
					(adjustment !== null && !Number.isFinite(adjustment)) ||
					!Number.isFinite(rate) ||
					rate <= 0
				) {
					return [key, {status: 'computed'}];
				}

				const timing = {
					keyframeDisplayOffsetAdjustment: adjustment,
					...(status.keyframePlaybackRateAdjustment === undefined
						? {}
						: {keyframePlaybackRateAdjustment: rate}),
				};
				if (status.status === 'static') {
					const value =
						status.numericExpression === undefined
							? status.codeValue
							: evaluateSourceNumericValue(status.numericExpression, config);
					return [
						key,
						status.numericExpression !== undefined && !Number.isFinite(value)
							? {status: 'computed'}
							: {...status, ...timing, codeValue: value},
					];
				}

				const keyframes = status.keyframes.map((keyframe) => ({
					...keyframe,
					frame: evaluateSourceNumericValue(keyframe.frame, config),
				}));
				if (
					keyframes.some(
						(keyframe, index) =>
							!Number.isFinite(keyframe.frame) ||
							(index > 0 && keyframe.frame <= keyframes[index - 1].frame),
					)
				) {
					return [key, {status: 'computed'}];
				}

				return [key, {...status, ...timing, keyframes}];
			}),
		);
	cached.set(configKey, result);
	if (cached.size > 8) cached.delete(cached.keys().next().value!);
	evaluatedProps.set(props, cached);
	return result;
};
