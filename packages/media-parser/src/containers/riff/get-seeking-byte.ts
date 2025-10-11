import {findLastKeyframe} from '../../find-last-keyframe';
import type {AvcState} from '../../state/avc/avc-state';
import type {RiffState} from '../../state/riff';
import type {SeekResolution} from '../../work-on-seek-request';
import type {Idx1Entry} from './riff-box';
import type {RiffSeekingHints} from './seeking-hints';

export const getSeekingByteForRiff = async ({
	info,
	time,
	riffState,
	avcState,
}: {
	info: RiffSeekingHints;
	time: number;
	riffState: RiffState;
	avcState: AvcState;
}): Promise<SeekResolution> => {
	const idx1Entries = await (info.hasIndex
		? riffState.lazyIdx1.waitForLoaded()
		: Promise.resolve(null));

	if (idx1Entries === null) {
		const lastKeyframe = findLastKeyframe({
			keyframes: info.observedKeyframes,
			timeInSeconds: time,
		});

		if (lastKeyframe === null) {
			return {
				type: 'valid-but-must-wait',
			};
		}

		riffState.sampleCounter.setSamplesFromSeek(lastKeyframe.sampleCounts);
		riffState.queuedBFrames.clear();
		avcState.clear();

		return {
			type: 'do-seek',
			byte: lastKeyframe.positionInBytes,
			timeInSeconds: Math.min(
				lastKeyframe.decodingTimeInSeconds,
				lastKeyframe.presentationTimeInSeconds,
			),
		};
	}

	if (idx1Entries.videoTrackIndex === null) {
		throw new Error('videoTrackIndex is null');
	}

	if (info.samplesPerSecond === null) {
		throw new Error('samplesPerSecond is null');
	}

	const index = Math.floor(time * info.samplesPerSecond);

	let bestEntry: Idx1Entry | null = null;

	for (const entry of idx1Entries.entries) {
		if (entry.sampleCounts[idx1Entries.videoTrackIndex] > index) {
			continue;
		}

		if (
			bestEntry &&
			entry.sampleCounts[idx1Entries.videoTrackIndex] <
				bestEntry.sampleCounts[idx1Entries.videoTrackIndex]
		) {
			continue;
		}

		bestEntry = entry;
	}

	if (!bestEntry) {
		throw new Error('No best entry');
	}

	if (info.moviOffset === null) {
		throw new Error('moviOffset is null');
	}

	riffState.sampleCounter.setSamplesFromSeek(bestEntry.sampleCounts);
	riffState.queuedBFrames.clear();
	avcState.clear();

	return {
		type: 'do-seek',
		byte: bestEntry.offset + info.moviOffset - 4,
		timeInSeconds:
			bestEntry.sampleCounts[idx1Entries.videoTrackIndex] /
			info.samplesPerSecond,
	};
};
