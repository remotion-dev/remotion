import type {SequencePropsSubscriptionKey} from 'remotion';

export const EFFECT_CLIPBOARD_MIME_TYPE =
	'application/vnd.remotion.effects-clipboard+json';

export type EffectClipboardPasteType = 'effects-additive' | 'effects-replacing';

export type EffectClipboardSource = {
	readonly fileName: string;
	readonly sequenceNodePath: SequencePropsSubscriptionKey;
} & (
	| {
			readonly type: 'single-effect';
			readonly effectIndex: number;
	  }
	| {
			readonly type: 'all-effects';
	  }
);

export type EffectClipboardData = {
	readonly type: EffectClipboardPasteType;
	readonly version: 1;
	readonly remotionClipboard: 'effects';
	readonly sources: EffectClipboardSource[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
};

const isStringArrayArray = (value: unknown): value is string[][] => {
	return Array.isArray(value) && value.every(isStringArray);
};

const isSequenceNodePath = (
	value: unknown,
): value is SequencePropsSubscriptionKey => {
	if (!isRecord(value)) {
		return false;
	}

	if (
		typeof value.absolutePath !== 'string' ||
		!Array.isArray(value.nodePath) ||
		!isStringArray(value.sequenceKeys) ||
		!isStringArrayArray(value.effectKeys)
	) {
		return false;
	}

	return value.nodePath.every(
		(item) => typeof item === 'string' || typeof item === 'number',
	);
};

const isEffectClipboardSource = (
	value: unknown,
): value is EffectClipboardSource => {
	if (!isRecord(value)) {
		return false;
	}

	if (
		typeof value.fileName !== 'string' ||
		!isSequenceNodePath(value.sequenceNodePath)
	) {
		return false;
	}

	if (value.type === 'all-effects') {
		return true;
	}

	return (
		value.type === 'single-effect' &&
		typeof value.effectIndex === 'number' &&
		Number.isInteger(value.effectIndex) &&
		value.effectIndex >= 0
	);
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
			parsed.version !== 1 ||
			(parsed.type !== 'effects-additive' &&
				parsed.type !== 'effects-replacing') ||
			!Array.isArray(parsed.sources) ||
			!parsed.sources.every(isEffectClipboardSource)
		) {
			return null;
		}

		return {
			type: parsed.type,
			version: 1,
			remotionClipboard: 'effects',
			sources: parsed.sources,
		};
	} catch {
		return null;
	}
};
