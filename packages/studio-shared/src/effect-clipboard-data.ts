export type EffectClipboardPasteType = 'effects-additive' | 'effects-replacing';

export type EffectClipboardSnapshot = {
	readonly callee: string;
	readonly importPath: string;
	readonly params: Record<string, unknown>;
};

export type EffectClipboardData = {
	readonly type: EffectClipboardPasteType;
	readonly version: 2;
	readonly remotionClipboard: 'effects';
	readonly effects: EffectClipboardSnapshot[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isEffectClipboardSnapshot = (
	value: unknown,
): value is EffectClipboardSnapshot => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.callee === 'string' &&
		typeof value.importPath === 'string' &&
		isRecord(value.params)
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
			parsed.version !== 2 ||
			(parsed.type !== 'effects-additive' &&
				parsed.type !== 'effects-replacing') ||
			!Array.isArray(parsed.effects) ||
			!parsed.effects.every(isEffectClipboardSnapshot)
		) {
			return null;
		}

		return {
			type: parsed.type,
			version: 2,
			remotionClipboard: 'effects',
			effects: parsed.effects,
		};
	} catch {
		return null;
	}
};
