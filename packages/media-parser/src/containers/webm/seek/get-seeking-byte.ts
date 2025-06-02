import type {MediaParserLogLevel} from '../../../log';
import {Log} from '../../../log';
import type {MediaParserKeyframe} from '../../../options';
import type {WebmSeekingHints} from '../../../seeking-hints';
import type {LazyCuesLoadedOrNull} from '../../../state/matroska/lazy-cues-fetch';
import type {WebmState} from '../../../state/matroska/webm';
import type {MediaSectionState} from '../../../state/video-section';
import type {SeekResolution} from '../../../work-on-seek-request';
import type {MatroskaCue} from './format-cues';

const toSeconds = (
	timeInTimescale: number,
	track: NonNullable<WebmSeekingHints['track']>,
) => {
	return (timeInTimescale / track.timescale) * 1000;
};

const findBiggestCueBeforeTime = ({
	cues,
	time,
	track,
}: {
	cues: MatroskaCue[];
	time: number;
	track: NonNullable<WebmSeekingHints['track']>;
}): MatroskaCue | undefined => {
	let biggestCueBeforeTime: MatroskaCue | undefined;
	for (const cue of cues) {
		const cueTimeInSeconds = toSeconds(cue.timeInTimescale, track);
		if (
			cueTimeInSeconds < time &&
			(!biggestCueBeforeTime ||
				cueTimeInSeconds >
					toSeconds(biggestCueBeforeTime.timeInTimescale, track))
		) {
			biggestCueBeforeTime = cue;
		}
	}

	return biggestCueBeforeTime;
};

const findKeyframeBeforeTime = ({
	keyframes,
	time,
}: {
	keyframes: MediaParserKeyframe[];
	time: number;
}) => {
	let keyframeBeforeTime: MediaParserKeyframe | undefined;
	for (const keyframe of keyframes) {
		if (
			keyframe.decodingTimeInSeconds < time &&
			(!keyframeBeforeTime ||
				keyframe.decodingTimeInSeconds >
					keyframeBeforeTime.decodingTimeInSeconds)
		) {
			keyframeBeforeTime = keyframe;
		}
	}

	return keyframeBeforeTime ?? null;
};

const getByteFromCues = ({
	cuesResponse,
	time,
	info,
	logLevel,
}: {
	cuesResponse: LazyCuesLoadedOrNull;
	time: number;
	info: WebmSeekingHints;
	logLevel: MediaParserLogLevel;
}) => {
	if (!cuesResponse) {
		Log.trace(logLevel, 'Has no Matroska cues at the moment, cannot use them');
		return null;
	}

	const {cues, segmentOffset} = cuesResponse;

	Log.trace(logLevel, 'Has Matroska cues. Will use them to perform a seek.');

	const biggestCueBeforeTime = findBiggestCueBeforeTime({
		cues,
		time,
		track: info.track!,
	});

	if (!biggestCueBeforeTime) {
		return null;
	}

	return {
		byte: biggestCueBeforeTime.clusterPositionInSegment + segmentOffset,
		timeInSeconds: toSeconds(biggestCueBeforeTime.timeInTimescale, info.track!),
	};
};

export const getSeekingByteFromMatroska = async ({
	time,
	webmState,
	info,
	logLevel,
	mediaSection,
}: {
	time: number;
	webmState: WebmState;
	info: WebmSeekingHints;
	logLevel: MediaParserLogLevel;
	mediaSection: MediaSectionState;
}): Promise<SeekResolution> => {
	if (!info.track) {
		Log.trace(logLevel, 'No video track found, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	const cuesResponse =
		info.loadedCues ??
		((await webmState.cues.getLoadedCues()) as LazyCuesLoadedOrNull);

	// Check if we have already read keyframes
	const byteFromObservedKeyframe = findKeyframeBeforeTime({
		keyframes: info.keyframes,
		time,
	});

	// Check if we have `Cues`
	const byteFromCues = getByteFromCues({
		cuesResponse,
		time,
		info,
		logLevel,
	});

	// Fallback: back to the beginning
	const byteFromFirstMediaSection = webmState.getFirstCluster()?.start ?? null;

	// Optimization possibility for later:
	// Don't seek back, if the last seen time is smaller than the time we want to seek to

	const seekPossibilities = [
		byteFromCues?.byte ?? null,
		byteFromObservedKeyframe?.positionInBytes ?? null,
		byteFromFirstMediaSection,
	].filter((n) => n !== null);

	const byteToSeekTo =
		seekPossibilities.length === 0 ? null : Math.max(...seekPossibilities);

	if (byteToSeekTo === null) {
		// dont know what to do
		return {
			type: 'invalid',
		};
	}

	// we have assured this is in a media section, but it might not be marked yet
	// setting size because there is deduplication and media sections which are encompassed
	// by others will get deleted
	mediaSection.addMediaSection({
		start: byteToSeekTo,
		size: 1,
	});

	const timeInSeconds = (() => {
		if (byteToSeekTo === byteFromObservedKeyframe?.positionInBytes) {
			return Math.min(
				byteFromObservedKeyframe.decodingTimeInSeconds,
				byteFromObservedKeyframe.presentationTimeInSeconds,
			);
		}

		if (byteToSeekTo === byteFromCues?.byte) {
			return byteFromCues.timeInSeconds;
		}

		if (byteToSeekTo === byteFromFirstMediaSection) {
			return 0;
		}

		throw new Error('Should not happen');
	})();

	return {
		type: 'do-seek',
		byte: byteToSeekTo,
		timeInSeconds,
	};
};
