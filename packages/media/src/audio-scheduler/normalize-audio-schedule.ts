import type {
	AudioScheduleEntry,
	NormalizedAudioSchedule,
	NormalizedAudioScheduleEntry,
} from './audio-scheduler-types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null;
};

function assertFiniteNumber(
	entryIndex: number,
	field: string,
	value: unknown,
): asserts value is number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must have a finite ${field}.`,
		);
	}
}

function assertNonNegativeNumber(
	entryIndex: number,
	field: string,
	value: unknown,
): asserts value is number {
	assertFiniteNumber(entryIndex, field, value);
	if (value < 0) {
		throw new RangeError(
			`AudioScheduler schedule entry ${entryIndex} must have a non-negative ${field}.`,
		);
	}
}

const resolveSource = ({
	entryIndex,
	src,
}: {
	entryIndex: number;
	src: unknown;
}): {renderSrc: string; previewSrc: string} => {
	if (typeof src === 'string') {
		if (src.length === 0) {
			throw new TypeError(
				`AudioScheduler schedule entry ${entryIndex} must have a non-empty src.`,
			);
		}

		return {renderSrc: src, previewSrc: src};
	}

	if (!isRecord(src)) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must have a string src or a source object with a render string.`,
		);
	}

	const renderSrc = src.render;
	if (typeof renderSrc !== 'string' || renderSrc.length === 0) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must have a non-empty render src.`,
		);
	}

	const previewSrc = src.preview;
	if (
		previewSrc !== undefined &&
		(typeof previewSrc !== 'string' || previewSrc.length === 0)
	) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must have a non-empty preview src when provided.`,
		);
	}

	return {renderSrc, previewSrc: previewSrc ?? renderSrc};
};

const normalizeEntry = (
	entry: AudioScheduleEntry,
	entryIndex: number,
): NormalizedAudioScheduleEntry => {
	if (!isRecord(entry)) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must be an object.`,
		);
	}

	const {id} = entry;
	if (typeof id !== 'string' || id.trim().length === 0) {
		throw new TypeError(
			`AudioScheduler schedule entry ${entryIndex} must have a non-empty id.`,
		);
	}

	const {startTimeInSeconds} = entry;
	assertNonNegativeNumber(entryIndex, 'startTimeInSeconds', startTimeInSeconds);

	const {durationInSeconds} = entry;
	assertFiniteNumber(entryIndex, 'durationInSeconds', durationInSeconds);
	if (durationInSeconds <= 0) {
		throw new RangeError(
			`AudioScheduler schedule entry ${entryIndex} must have a durationInSeconds greater than zero.`,
		);
	}

	const {sourceStartTimeInSeconds} = entry;
	assertNonNegativeNumber(
		entryIndex,
		'sourceStartTimeInSeconds',
		sourceStartTimeInSeconds,
	);

	const volume = entry.volume ?? 1;
	assertFiniteNumber(entryIndex, 'volume', volume);
	if (volume < 0 || volume > 1) {
		throw new RangeError(
			`AudioScheduler schedule entry ${entryIndex} must have a volume between 0 and 1.`,
		);
	}

	const fadeInDurationInSeconds = entry.fadeInDurationInSeconds ?? 0;
	assertNonNegativeNumber(
		entryIndex,
		'fadeInDurationInSeconds',
		fadeInDurationInSeconds,
	);

	const fadeOutDurationInSeconds = entry.fadeOutDurationInSeconds ?? 0;
	assertNonNegativeNumber(
		entryIndex,
		'fadeOutDurationInSeconds',
		fadeOutDurationInSeconds,
	);

	const {renderSrc, previewSrc} = resolveSource({
		entryIndex,
		src: entry.src,
	});

	return Object.freeze({
		id,
		renderSrc,
		previewSrc,
		startTimeInSeconds,
		durationInSeconds,
		sourceStartTimeInSeconds,
		volume,
		fadeInDurationInSeconds: Math.min(
			fadeInDurationInSeconds,
			durationInSeconds,
		),
		fadeOutDurationInSeconds: Math.min(
			fadeOutDurationInSeconds,
			durationInSeconds,
		),
		originalIndex: entryIndex,
	});
};

export const normalizeAudioSchedule = (
	schedule: readonly AudioScheduleEntry[],
): NormalizedAudioSchedule => {
	if (!Array.isArray(schedule)) {
		throw new TypeError('AudioScheduler schedule must be an array.');
	}

	const ids = new Set<string>();
	const normalized = schedule.map((entry, entryIndex) => {
		const normalizedEntry = normalizeEntry(entry, entryIndex);
		if (ids.has(normalizedEntry.id)) {
			throw new Error(
				`AudioScheduler schedule contains duplicate id "${normalizedEntry.id}".`,
			);
		}

		ids.add(normalizedEntry.id);
		return normalizedEntry;
	});

	return Object.freeze(normalized);
};
