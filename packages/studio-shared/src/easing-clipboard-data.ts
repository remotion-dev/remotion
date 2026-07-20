import type {KeyframeEasing} from './keyframe-easing-presets';

export type EasingClipboardData = {
	readonly type: 'easing';
	readonly version: 1;
	readonly remotionClipboard: 'easing';
	readonly easing: KeyframeEasing;
};

export type EasingClipboardDataParseResult =
	| {
			readonly status: 'valid';
			readonly data: EasingClipboardData;
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

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

export const isKeyframeEasing = (value: unknown): value is KeyframeEasing => {
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

export const normalizeKeyframeEasing = (
	easing: KeyframeEasing,
): KeyframeEasing => {
	if (easing.type !== 'spring') {
		return easing;
	}

	return {
		...easing,
		allowTail: easing.allowTail ?? null,
		durationRestThreshold: easing.durationRestThreshold ?? null,
	};
};

export const parseEasingClipboardDataResult = (
	value: string,
): EasingClipboardDataParseResult => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return {status: 'invalid'};
		}

		if (parsed.remotionClipboard !== 'easing') {
			return {status: 'invalid'};
		}

		if (parsed.version !== 1) {
			return {
				status: 'unsupported-version',
				version: parsed.version,
			};
		}

		if (parsed.type !== 'easing' || !isKeyframeEasing(parsed.easing)) {
			return {status: 'invalid'};
		}

		return {
			status: 'valid',
			data: {
				type: 'easing',
				version: 1,
				remotionClipboard: 'easing',
				easing: normalizeKeyframeEasing(parsed.easing),
			},
		};
	} catch {
		return {status: 'invalid'};
	}
};

export const parseEasingClipboardData = (
	value: string,
): EasingClipboardData | null => {
	const result = parseEasingClipboardDataResult(value);
	if (result.status !== 'valid') {
		return null;
	}

	return result.data;
};
