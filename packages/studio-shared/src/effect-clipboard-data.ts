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

const normalizeV2Snapshot = (
	value: unknown,
): EffectClipboardSnapshot | null => {
	if (!isRecord(value)) {
		return null;
	}

	if (
		typeof value.callee !== 'string' ||
		typeof value.importPath !== 'string' ||
		!isRecord(value.params)
	) {
		return null;
	}

	const params: Record<string, EffectClipboardParam> = {};
	for (const [key, paramValue] of Object.entries(value.params)) {
		params[key] = {
			type: 'static',
			value: paramValue,
		};
	}

	return {
		callee: value.callee,
		importPath: value.importPath,
		params,
	};
};

export const parseEffectClipboardData = (
	value: string,
): EffectClipboardData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (
			parsed.remotionClipboard !== 'effects' ||
			(parsed.type !== 'effects-additive' &&
				parsed.type !== 'effects-replacing') ||
			!Array.isArray(parsed.effects)
		) {
			return null;
		}

		const effects =
			parsed.version === 2
				? parsed.effects.map(normalizeV2Snapshot)
				: parsed.version === 3 &&
					  parsed.effects.every(isEffectClipboardSnapshotV3)
					? parsed.effects
					: null;
		if (!effects || effects.some((effect) => effect === null)) {
			return null;
		}

		return {
			type: parsed.type,
			version: 3,
			remotionClipboard: 'effects',
			effects: effects as EffectClipboardSnapshot[],
		};
	} catch {
		return null;
	}
};
