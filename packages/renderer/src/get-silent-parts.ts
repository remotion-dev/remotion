import {startLongRunningCompositor} from './compositor/compositor';
import type {
	GetSilentPartsResponse,
	GetSilentPartsResponseRust,
	SilentPart,
	SilentParts,
} from './compositor/payloads';
import type {LogLevel} from './log-level';

export type {SilentPart};

/*
 * @description Gets the silent parts of a video or audio in Node.js. Useful for cutting out silence from a video.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/get-silent-parts)
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

	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: logLevel ?? 'info',
		indent: false,
		binariesDirectory: binariesDirectory ?? null,
		extraThreads: 0,
	});

	let res: Uint8Array;
	try {
		res = await compositor.executeCommand('GetSilences', {
			src,
			minDurationInSeconds,
			noiseThresholdInDecibels,
		});
	} catch (executeError) {
		// Shut down the compositor so that it does not keep the Node.js process alive,
		// but surface the original error rather than a shutdown error
		await compositor.shutDownOrKill().catch(() => undefined);
		throw executeError;
	}

	await compositor.shutDownOrKill();

	const {silentParts, durationInSeconds} = JSON.parse(
		new TextDecoder('utf-8').decode(res),
	) as GetSilentPartsResponseRust;

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
