import {startLongRunningCompositor} from './compositor/compositor';
import type {
	GetSilentPartsResponse,
	GetSilentPartsResponseRust,
	SilentPart,
	SilentParts,
} from './compositor/payloads';
import type {LogLevel} from './log-level';

export type {SilentPart};

/**
 * Analyzes the silent parts of a video or audio file and returns both the silent and audible segments.
 * @description Uses thresholds defined for noise and duration to identify silent stretches in a media file.
 * @see [Documentation](https://remotion.dev/docs/renderer/get-silent-parts)
 * @param {Object} params Configuration parameters for determining silent parts
 * @param {string} params.src The path to the local video or audio file
 * @param {number} [params.noiseThresholdInDecibels=-20] The decibel level below which sound is considered silent
 * @param {number} [params.minDurationInSeconds=1] The minimum duration (in seconds) to consider a silence as significant
 * @param {string|null} [params.binariesDirectory] Optional directory path for external binaries
 * @param {LogLevel} [params.logLevel] The logging level to be used (debug, verbose, info, warn, error)
 * @returns {Promise<GetSilentPartsResponse>} An object containing arrays of silent and audible parts, along with the overall duration
 */
export const getSilentParts = async ({
	src,
	noiseThresholdInDecibels: passedNoiseThresholdInDecibels,
	minDurationInSeconds: passedMinDuration,
	logLevel,
	binariesDirectory,
}: {
	src: string;
	minDurationInSeconds?: number;
	logLevel?: LogLevel;
	noiseThresholdInDecibels?: number;
	binariesDirectory?: string | null;
}): Promise<GetSilentPartsResponse> => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: logLevel ?? 'info',
		indent: false,
		binariesDirectory: binariesDirectory ?? null,
	});

	const minDurationInSeconds = passedMinDuration ?? 1;

	if (typeof minDurationInSeconds !== 'number') {
		throw new Error(
			`minDurationInSeconds must be a number, but was ${minDurationInSeconds}`,
		);
	}

	if (minDurationInSeconds <= 0) {
		throw new Error(
			`minDurationInSeconds must be greater than 0, but was ${minDurationInSeconds}`,
		);
	}

	const noiseThresholdInDecibels = passedNoiseThresholdInDecibels ?? -20;

	if (typeof noiseThresholdInDecibels !== 'number') {
		throw new Error(
			`noiseThresholdInDecibels must be a number, but was ${noiseThresholdInDecibels}`,
		);
	}

	if (noiseThresholdInDecibels >= 30) {
		throw new Error(
			`noiseThresholdInDecibels must be less than 30, but was ${noiseThresholdInDecibels}`,
		);
	}

	const res = await compositor.executeCommand('GetSilences', {
		src,
		minDurationInSeconds,
		noiseThresholdInDecibels,
	});

	const response = JSON.parse(
		new TextDecoder('utf-8').decode(res),
	) as GetSilentPartsResponseRust;

	await compositor.finishCommands();
	await compositor.waitForDone();

	const {silentParts, durationInSeconds} = response;

	return {
		silentParts,
		audibleParts: getAudibleParts({silentParts, durationInSeconds}),
		durationInSeconds,
	};
};

const getAudibleParts = ({
	silentParts,
	durationInSeconds,
}: {
	silentParts: SilentParts;
	durationInSeconds: number;
}) => {
	const audibleParts: SilentParts = [];
	let lastEnd = 0;
	for (const silentPart of silentParts) {
		if (silentPart.startInSeconds - lastEnd > 0) {
			audibleParts.push({
				startInSeconds: lastEnd,
				endInSeconds: silentPart.startInSeconds,
			});
		}

		lastEnd = silentPart.endInSeconds;
	}

	if (durationInSeconds - lastEnd > 0) {
		audibleParts.push({
			startInSeconds: lastEnd,
			endInSeconds: durationInSeconds,
		});
	}

	return audibleParts;
};
