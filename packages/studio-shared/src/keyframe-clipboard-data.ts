import type {InteractivitySchemaField} from 'remotion';
import {
	isKeyframeEasing,
	normalizeKeyframeEasing,
} from './easing-clipboard-data';
import type {KeyframeEasing} from './keyframe-easing-presets';

// Keep this exhaustive so every new schema field requires an explicit clipboard
// compatibility decision.
const KEYFRAME_CLIPBOARD_FIELD_TYPE_SUPPORT = {
	array: false,
	asset: false,
	boolean: false,
	color: true,
	enum: false,
	'font-family': false,
	hidden: false,
	number: true,
	'rotation-css': true,
	'rotation-degrees': true,
	scale: true,
	'text-content': false,
	'transform-origin': true,
	translate: true,
	'uv-coordinate': true,
} as const satisfies Record<InteractivitySchemaField['type'], boolean>;

type KeyframeClipboardFieldTypeSupport =
	typeof KEYFRAME_CLIPBOARD_FIELD_TYPE_SUPPORT;

export type KeyframeClipboardFieldType = {
	[FieldType in keyof KeyframeClipboardFieldTypeSupport]: KeyframeClipboardFieldTypeSupport[FieldType] extends true
		? FieldType
		: never;
}[keyof KeyframeClipboardFieldTypeSupport];

export type KeyframeClipboardField =
	| {
			readonly type: 'sequence';
			readonly fieldKey: string;
	  }
	| {
			readonly type: 'effect';
			readonly fieldKey: string;
	  };

export type KeyframeClipboardData = {
	readonly type: 'keyframe';
	readonly version: 1;
	readonly remotionClipboard: 'keyframe';
	readonly fieldType: KeyframeClipboardFieldType | null;
	readonly field?: KeyframeClipboardField;
	readonly keyframes: readonly {
		readonly frameOffset: number;
		readonly value: unknown;
	}[];
	readonly easing: readonly KeyframeEasing[];
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

export const isKeyframeClipboardFieldType = (
	value: unknown,
): value is KeyframeClipboardFieldType => {
	return (
		typeof value === 'string' &&
		Object.hasOwn(KEYFRAME_CLIPBOARD_FIELD_TYPE_SUPPORT, value) &&
		KEYFRAME_CLIPBOARD_FIELD_TYPE_SUPPORT[
			value as keyof KeyframeClipboardFieldTypeSupport
		]
	);
};

const isKeyframeClipboardEntry = (
	value: unknown,
): value is KeyframeClipboardData['keyframes'][number] => {
	return (
		isRecord(value) &&
		Number.isInteger(value.frameOffset) &&
		Object.hasOwn(value, 'value')
	);
};

const areValidKeyframes = (
	value: unknown,
): value is KeyframeClipboardData['keyframes'] => {
	if (!Array.isArray(value) || value.length === 0) {
		return false;
	}

	let previousOffset = -1;
	for (const keyframe of value) {
		if (
			!isKeyframeClipboardEntry(keyframe) ||
			keyframe.frameOffset <= previousOffset
		) {
			return false;
		}

		previousOffset = keyframe.frameOffset;
	}

	return value[0]?.frameOffset === 0;
};

const isKeyframeClipboardField = (
	value: unknown,
): value is KeyframeClipboardField => {
	return (
		isRecord(value) &&
		(value.type === 'sequence' || value.type === 'effect') &&
		typeof value.fieldKey === 'string'
	);
};

const parseEasings = ({
	value,
	keyframeCount,
}: {
	value: unknown;
	keyframeCount: number;
}): KeyframeEasing[] | null => {
	if (
		Array.isArray(value) &&
		value.length === Math.max(0, keyframeCount - 1) &&
		value.every(isKeyframeEasing)
	) {
		return value.map(normalizeKeyframeEasing);
	}

	return null;
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

		const easing = parseEasings({
			value: parsed.easing,
			keyframeCount: Array.isArray(parsed.keyframes)
				? parsed.keyframes.length
				: 0,
		});
		if (
			parsed.type !== 'keyframe' ||
			!areValidKeyframes(parsed.keyframes) ||
			easing === null ||
			(Object.hasOwn(parsed, 'field') &&
				!isKeyframeClipboardField(parsed.field)) ||
			(parsed.fieldType !== null &&
				!isKeyframeClipboardFieldType(parsed.fieldType))
		) {
			return {status: 'invalid'};
		}

		const field = Object.hasOwn(parsed, 'field')
			? {field: parsed.field as KeyframeClipboardField}
			: {};

		return {
			status: 'valid',
			data: {
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: parsed.fieldType,
				...field,
				keyframes: parsed.keyframes,
				easing,
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
