export type EffectClipboardPasteType = 'effects-additive' | 'effects-replacing';

export type EffectClipboardStaticParam = {
	readonly type: 'static';
	readonly value: unknown;
};

export type EffectClipboardInterpolationFunction =
	| 'interpolate'
	| 'interpolateColors';

export type EffectClipboardKeyframe = {
	readonly frame: number;
	readonly value: unknown;
};

export type EffectClipboardEasing = 'linear' | [number, number, number, number];

export type EffectClipboardExtrapolateType =
	| 'extend'
	| 'identity'
	| 'clamp'
	| 'wrap';

export type EffectClipboardClamping = {
	readonly left: EffectClipboardExtrapolateType;
	readonly right: EffectClipboardExtrapolateType;
};

export type EffectClipboardKeyframedParam = {
	readonly type: 'keyframed';
	readonly interpolationFunction: EffectClipboardInterpolationFunction;
	readonly keyframes: EffectClipboardKeyframe[];
	readonly easing: EffectClipboardEasing[];
	readonly clamping: EffectClipboardClamping;
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const extrapolateTypes = new Set(['extend', 'identity', 'clamp', 'wrap']);

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

const isEasing = (value: unknown): value is EffectClipboardEasing => {
	return (
		value === 'linear' ||
		(Array.isArray(value) &&
			value.length === 4 &&
			value.every((item) => isFiniteNumber(item)))
	);
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
	const easingLength =
		Array.isArray(value.keyframes) && value.keyframes.length > 0
			? value.keyframes.length - 1
			: null;
	return (
		(value.interpolationFunction === 'interpolate' ||
			value.interpolationFunction === 'interpolateColors') &&
		Array.isArray(value.keyframes) &&
		value.keyframes.length > 0 &&
		value.keyframes.every(isKeyframe) &&
		Array.isArray(value.easing) &&
		value.easing.length === easingLength &&
		value.easing.every(isEasing) &&
		isClamping(value.clamping) &&
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

			effects.push(effect);
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
