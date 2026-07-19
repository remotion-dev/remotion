import type {InteractivitySchemaField} from 'remotion';
import {
	isKeyframeEasing,
	normalizeKeyframeEasing,
} from './easing-clipboard-data';
import type {KeyframeEasing} from './keyframe-easing-presets';

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
