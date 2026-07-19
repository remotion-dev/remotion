import type {InteractivitySchemaField} from 'remotion';

export type KeyframeClipboardFieldType = Exclude<
	InteractivitySchemaField['type'],
	| 'array'
	| 'asset'
	| 'boolean'
	| 'enum'
	| 'font-family'
	| 'hidden'
	| 'text-content'
>;

export type KeyframeClipboardData = {
	readonly type: 'keyframe';
	readonly version: 1;
	readonly remotionClipboard: 'keyframe';
	readonly fieldType: KeyframeClipboardFieldType | null;
	readonly value: unknown;
};

export type KeyframeClipboardDataParseResult =
	| {
			readonly status: 'valid';
			readonly data: KeyframeClipboardData;
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

const KEYFRAMABLE_FIELD_TYPES: readonly KeyframeClipboardFieldType[] = [
	'number',
	'rotation-css',
	'rotation-degrees',
	'translate',
	'transform-origin',
	'scale',
	'uv-coordinate',
	'color',
];

const isKeyframeClipboardFieldType = (
	value: unknown,
): value is KeyframeClipboardFieldType => {
	return KEYFRAMABLE_FIELD_TYPES.includes(value as KeyframeClipboardFieldType);
};

export const parseKeyframeClipboardDataResult = (
	value: string,
): KeyframeClipboardDataParseResult => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed) || parsed.remotionClipboard !== 'keyframe') {
			return {status: 'invalid'};
		}

		if (parsed.version !== 1) {
			return {status: 'unsupported-version', version: parsed.version};
		}

		if (
			parsed.type !== 'keyframe' ||
			!Object.hasOwn(parsed, 'value') ||
			(parsed.fieldType !== null &&
				!isKeyframeClipboardFieldType(parsed.fieldType))
		) {
			return {status: 'invalid'};
		}

		return {
			status: 'valid',
			data: {
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: parsed.fieldType,
				value: parsed.value,
			},
		};
	} catch {
		return {status: 'invalid'};
	}
};

export const parseKeyframeClipboardData = (
	value: string,
): KeyframeClipboardData | null => {
	const result = parseKeyframeClipboardDataResult(value);
	return result.status === 'valid' ? result.data : null;
};
