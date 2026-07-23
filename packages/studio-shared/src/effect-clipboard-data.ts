import type {KeyframeEasing} from './keyframe-easing-presets';
import {
	isKeyframeInterpolationFunction,
	type KeyframeInterpolationFunction,
} from './keyframe-interpolation-function';

export type EffectClipboardPasteType = 'effects-additive' | 'effects-replacing';

export type EffectClipboardStaticParam = {
	readonly type: 'static';
	readonly value: unknown;
};

export type EffectClipboardInterpolationFunction =
	KeyframeInterpolationFunction;

export type EffectClipboardKeyframe = {
	readonly frame: number;
	readonly value: unknown;
};

export type EffectClipboardEasing = KeyframeEasing;

export type EffectClipboardExtrapolateType =
	| 'extend'
	| 'identity'
	| 'clamp'
	| 'wrap';

export type EffectClipboardClamping = {
	readonly left: EffectClipboardExtrapolateType;
	readonly right: EffectClipboardExtrapolateType;
};

export type EffectClipboardOutput = 'linear' | 'perceptual-scale';

export type EffectClipboardKeyframedParam = {
	readonly type: 'keyframed';
	readonly interpolationFunction: EffectClipboardInterpolationFunction;
	readonly keyframes: EffectClipboardKeyframe[];
	readonly easing: EffectClipboardEasing[];
	readonly clamping: EffectClipboardClamping;
	readonly output?: EffectClipboardOutput;
	readonly posterize?: number;
};

export type EffectClipboardParam =
	| EffectClipboardStaticParam
	| EffectClipboardKeyframedParam;

export type EffectClipboardSnapshot = {
	readonly callee: string;
	readonly importPath: string;
	readonly params: Record<string, EffectClipboardParam>;
};

export type EffectClipboardData = {
	readonly type: EffectClipboardPasteType;
	readonly version: 3;
	readonly remotionClipboard: 'effects';
	readonly effects: EffectClipboardSnapshot[];
};

export type EffectPropClipboardData = {
	readonly type: 'effect-prop';
	readonly version: 1;
	readonly remotionClipboard: 'effect-prop';
	readonly effect: {
		readonly callee: string;
		readonly importPath: string;
	};
	readonly key: string;
	readonly param: EffectClipboardParam;
};

export type EffectClipboardDataParseResult =
	| {
			readonly status: 'valid';
			readonly data: EffectClipboardData;
	  }
	| {
			readonly status: 'unsupported-version';
			readonly version: unknown;
	  }
	| {
			readonly status: 'invalid';
	  };

export type EffectPropClipboardDataParseResult =
	| {
			readonly status: 'valid';
			readonly data: EffectPropClipboardData;
	  }
	| {
			readonly status: 'unsupported-version';
			readonly version: unknown;
	  }
	| {
			readonly status: 'invalid';
	  };

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const extrapolateTypes = new Set(['extend', 'identity', 'clamp', 'wrap']);
const outputOptions = new Set(['linear', 'perceptual-scale']);

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

const isEasing = (value: unknown): value is EffectClipboardEasing => {
	return (
		isRecord(value) &&
		(value.type === 'linear' ||
			(value.type === 'bezier' &&
				isFiniteNumber(value.x1) &&
				isFiniteNumber(value.y1) &&
				isFiniteNumber(value.x2) &&
				isFiniteNumber(value.y2)) ||
			(value.type === 'spring' &&
				isFiniteNumber(value.damping) &&
				isFiniteNumber(value.mass) &&
				isFiniteNumber(value.stiffness) &&
				(value.allowTail === undefined ||
					value.allowTail === null ||
					typeof value.allowTail === 'boolean') &&
				(value.durationRestThreshold === undefined ||
					value.durationRestThreshold === null ||
					isFiniteNumber(value.durationRestThreshold)) &&
				typeof value.overshootClamping === 'boolean'))
	);
};

const normalizeEasing = (
	easing: EffectClipboardEasing,
): EffectClipboardEasing => {
	if (easing.type !== 'spring') {
		return easing;
	}

	return {
		...easing,
		allowTail: easing.allowTail ?? null,
		durationRestThreshold: easing.durationRestThreshold ?? null,
	};
};

const normalizeParam = (param: EffectClipboardParam): EffectClipboardParam => {
	if (param.type === 'static') {
		return param;
	}

	return {
		...param,
		easing: param.easing.map(normalizeEasing),
	};
};

const normalizeSnapshot = (
	snapshot: EffectClipboardSnapshot,
): EffectClipboardSnapshot => {
	return {
		...snapshot,
		params: Object.fromEntries(
			Object.entries(snapshot.params).map(([key, param]) => [
				key,
				normalizeParam(param),
			]),
		),
	};
};

const isKeyframe = (value: unknown): value is EffectClipboardKeyframe => {
	return isRecord(value) && isFiniteNumber(value.frame) && 'value' in value;
};

const isClamping = (value: unknown): value is EffectClipboardClamping => {
	return (
		isRecord(value) &&
		typeof value.left === 'string' &&
		extrapolateTypes.has(value.left) &&
		typeof value.right === 'string' &&
		extrapolateTypes.has(value.right)
	);
};

const isEffectClipboardParam = (
	value: unknown,
): value is EffectClipboardParam => {
	if (!isRecord(value)) {
		return false;
	}

	if (value.type === 'static') {
		return 'value' in value;
	}

	if (value.type !== 'keyframed') {
		return false;
	}

	const {posterize} = value;
	const {output} = value;
	const easingLength =
		Array.isArray(value.keyframes) && value.keyframes.length > 0
			? value.keyframes.length - 1
			: null;
	return (
		typeof value.interpolationFunction === 'string' &&
		isKeyframeInterpolationFunction(value.interpolationFunction) &&
		Array.isArray(value.keyframes) &&
		value.keyframes.length > 0 &&
		value.keyframes.every(isKeyframe) &&
		Array.isArray(value.easing) &&
		value.easing.length === easingLength &&
		value.easing.every(isEasing) &&
		isClamping(value.clamping) &&
		(output === undefined ||
			(value.interpolationFunction === 'interpolate' &&
				typeof output === 'string' &&
				outputOptions.has(output))) &&
		(posterize === undefined || (isFiniteNumber(posterize) && posterize > 0))
	);
};

const isEffectClipboardSnapshotV3 = (
	value: unknown,
): value is EffectClipboardSnapshot => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.callee === 'string' &&
		typeof value.importPath === 'string' &&
		isRecord(value.params) &&
		Object.values(value.params).every(isEffectClipboardParam)
	);
};

export const parseEffectClipboardDataResult = (
	value: string,
): EffectClipboardDataParseResult => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return {status: 'invalid'};
		}

		if (parsed.remotionClipboard !== 'effects') {
			return {status: 'invalid'};
		}

		if (parsed.version !== 3) {
			return {
				status: 'unsupported-version',
				version: parsed.version,
			};
		}

		if (
			parsed.type !== 'effects-additive' &&
			parsed.type !== 'effects-replacing'
		) {
			return {status: 'invalid'};
		}

		if (!Array.isArray(parsed.effects)) {
			return {status: 'invalid'};
		}

		const effects: EffectClipboardSnapshot[] = [];
		for (const effect of parsed.effects) {
			if (!isEffectClipboardSnapshotV3(effect)) {
				return {status: 'invalid'};
			}

			effects.push(normalizeSnapshot(effect));
		}

		return {
			status: 'valid',
			data: {
				type: parsed.type,
				version: 3,
				remotionClipboard: 'effects',
				effects,
			},
		};
	} catch {
		return {status: 'invalid'};
	}
};

export const parseEffectClipboardData = (
	value: string,
): EffectClipboardData | null => {
	const result = parseEffectClipboardDataResult(value);
	if (result.status !== 'valid') {
		return null;
	}

	return result.data;
};

export const parseEffectPropClipboardDataResult = (
	value: string,
): EffectPropClipboardDataParseResult => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return {status: 'invalid'};
		}

		if (parsed.remotionClipboard !== 'effect-prop') {
			return {status: 'invalid'};
		}

		if (parsed.version !== 1) {
			return {
				status: 'unsupported-version',
				version: parsed.version,
			};
		}

		if (parsed.type !== 'effect-prop') {
			return {status: 'invalid'};
		}

		if (!isRecord(parsed.effect)) {
			return {status: 'invalid'};
		}

		if (
			typeof parsed.effect.callee !== 'string' ||
			typeof parsed.effect.importPath !== 'string'
		) {
			return {status: 'invalid'};
		}

		if (typeof parsed.key !== 'string') {
			return {status: 'invalid'};
		}

		if (!isEffectClipboardParam(parsed.param)) {
			return {status: 'invalid'};
		}

		return {
			status: 'valid',
			data: {
				type: 'effect-prop',
				version: 1,
				remotionClipboard: 'effect-prop',
				effect: {
					callee: parsed.effect.callee,
					importPath: parsed.effect.importPath,
				},
				key: parsed.key,
				param: normalizeParam(parsed.param),
			},
		};
	} catch {
		return {status: 'invalid'};
	}
};

export const parseEffectPropClipboardData = (
	value: string,
): EffectPropClipboardData | null => {
	const result = parseEffectPropClipboardDataResult(value);
	if (result.status !== 'valid') {
		return null;
	}

	return result.data;
};
