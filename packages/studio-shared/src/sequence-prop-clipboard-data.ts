import type {EffectClipboardParam} from './effect-clipboard-data';
import {
	isEffectClipboardParam,
	normalizeEffectClipboardParam,
} from './effect-clipboard-data';
import type {KeyframeClipboardFieldType} from './keyframe-clipboard-data';
import {isKeyframeClipboardFieldType} from './keyframe-clipboard-data';

export type SequencePropClipboardData = {
	readonly type: 'sequence-prop';
	readonly version: 1;
	readonly remotionClipboard: 'sequence-prop';
	readonly key: string;
	readonly fieldType: KeyframeClipboardFieldType;
	readonly param: EffectClipboardParam;
};

export type SequencePropClipboardDataParseResult =
	| {
			readonly status: 'valid';
			readonly data: SequencePropClipboardData;
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

export const parseSequencePropClipboardDataResult = (
	value: string,
): SequencePropClipboardDataParseResult => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed) || parsed.remotionClipboard !== 'sequence-prop') {
			return {status: 'invalid'};
		}

		if (parsed.version !== 1) {
			return {status: 'unsupported-version', version: parsed.version};
		}

		if (
			parsed.type !== 'sequence-prop' ||
			typeof parsed.key !== 'string' ||
			!isKeyframeClipboardFieldType(parsed.fieldType) ||
			!isEffectClipboardParam(parsed.param)
		) {
			return {status: 'invalid'};
		}

		return {
			status: 'valid',
			data: {
				type: 'sequence-prop',
				version: 1,
				remotionClipboard: 'sequence-prop',
				key: parsed.key,
				fieldType: parsed.fieldType,
				param: normalizeEffectClipboardParam(parsed.param),
			},
		};
	} catch {
		return {status: 'invalid'};
	}
};

export const parseSequencePropClipboardData = (
	value: string,
): SequencePropClipboardData | null => {
	const result = parseSequencePropClipboardDataResult(value);
	return result.status === 'valid' ? result.data : null;
};
