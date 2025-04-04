import type {LogLevel} from '../../../log';
import {Log} from '../../../log';
import type {MediaParserKeyframe} from '../../../options';
import type {WebmSeekingInfo} from '../../../seeking-info';
import type {KeyframesState} from '../../../state/keyframes';
import type {LazyCuesLoaded} from '../../../state/matroska/lazy-cues-fetch';
import type {WebmState} from '../../../state/matroska/webm';
import type {MediaSectionState} from '../../../state/video-section';
import type {SeekResolution} from '../../../work-on-seek-request';
import type {MatroskaCue} from './format-cues';

const toSeconds = (
	timeInTimescale: number,
	track: NonNullable<WebmSeekingInfo['track']>,
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
	track: NonNullable<WebmSeekingInfo['track']>;
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

const getStartOfClusterToSeekTo = ({
	biggestCueBeforeTime,
	segmentOffset,
}: {
	biggestCueBeforeTime: MatroskaCue | undefined;
	segmentOffset: number;
}): number | null => {
	if (biggestCueBeforeTime) {
		return biggestCueBeforeTime.clusterPositionInSegment + segmentOffset;
	}

	return null;
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

	return keyframeBeforeTime?.positionInBytes ?? null;
};

const getByteFromCues = ({
	cuesResponse,
	time,
	info,
	logLevel,
}: {
	cuesResponse: LazyCuesLoaded;
	time: number;
	info: WebmSeekingInfo;
	logLevel: LogLevel;
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

	const startOfClusterToSeekTo = getStartOfClusterToSeekTo({
		biggestCueBeforeTime,
		segmentOffset,
	});

	return startOfClusterToSeekTo;
};

export const getSeekingByteFromMatroska = async ({
	time,
	webmState,
	info,
	logLevel,
	mediaSection,
	keyframes,
}: {
	time: number;
	webmState: WebmState;
	info: WebmSeekingInfo;
	logLevel: LogLevel;
	mediaSection: MediaSectionState;
	keyframes: KeyframesState;
}): Promise<SeekResolution> => {
	if (!info.track) {
		Log.trace(logLevel, 'No video track found, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	const cuesResponse = (await webmState.cues.getLoadedCues()) as LazyCuesLoaded;
	const byteFromObservedKeyframe = findKeyframeBeforeTime({
		keyframes: keyframes.getKeyframes(),
		time,
	});

	const byteFromCues = getByteFromCues({
		cuesResponse,
		time,
		info,
		logLevel,
	});

	const byteFromFirstMediaSection = webmState.getFirstCluster()?.start ?? null;

	const seekPossibilities = [
		byteFromCues,
		byteFromObservedKeyframe,
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

	return {
		type: 'do-seek',
		byte: byteToSeekTo,
	};
};
