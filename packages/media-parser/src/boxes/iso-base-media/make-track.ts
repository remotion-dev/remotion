import {
	getAudioCodecStringFromTrak,
	getNumberOfChannelsFromTrak,
} from '../../get-audio-codec';
import {
	getTimescaleAndDuration,
	trakBoxContainsAudio,
	trakBoxContainsVideo,
} from '../../get-fps';
import {
	applyAspectRatios,
	getDisplayAspectRatio,
	getSampleAspectRatio,
	getVideoSample,
} from '../../get-sample-aspect-ratio';
import {getSamplePositions} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {getVideoCodecString} from '../../get-video-codec';
import {
	getCttsBox,
	getStcoBox,
	getStscBox,
	getStssBox,
	getStszBox,
	getSttsBox,
	getTkhdBox,
	getVideoDescriptors,
} from '../../traversal';
import type {TrakBox} from './trak/trak';

export const makeBaseMediaTrack = (
	trakBox: TrakBox,
): VideoTrack | AudioTrack | OtherTrack | null => {
	const stszBox = getStszBox(trakBox);
	const stcoBox = getStcoBox(trakBox);
	const stscBox = getStscBox(trakBox);
	const stssBox = getStssBox(trakBox);
	const sttsBox = getSttsBox(trakBox);
	const tkhdBox = getTkhdBox(trakBox);
	const cttsBox = getCttsBox(trakBox);
	const videoDescriptors = getVideoDescriptors(trakBox);
	const timescaleAndDuration = getTimescaleAndDuration(trakBox);

	if (!tkhdBox) {
		throw new Error('Expected tkhd box in trak box');
	}

	if (!stszBox) {
		throw new Error('Expected stsz box in trak box');
	}

	if (!stcoBox) {
		throw new Error('Expected stco box in trak box');
	}

	if (!stscBox) {
		throw new Error('Expected stsc box in trak box');
	}

	if (!sttsBox) {
		throw new Error('Expected stts box in trak box');
	}

	if (!timescaleAndDuration) {
		throw new Error('Expected timescale and duration in trak box');
	}

	const samplePositions = getSamplePositions({
		stcoBox,
		stscBox,
		stszBox,
		stssBox,
		sttsBox,
		cttsBox,
	});

	if (trakBoxContainsAudio(trakBox)) {
		const numberOfChannels = getNumberOfChannelsFromTrak(trakBox);
		if (numberOfChannels === null) {
			throw new Error('Could not find number of channels');
		}

		return {
			type: 'audio',
			samplePositions,
			trackId: tkhdBox.trackId,
			timescale: timescaleAndDuration.timescale,
			codecString: getAudioCodecStringFromTrak(trakBox),
			numberOfChannels,
		};
	}

	if (!trakBoxContainsVideo(trakBox)) {
		return {
			type: 'other',
			samplePositions,
			trackId: tkhdBox.trackId,
			timescale: timescaleAndDuration.timescale,
		};
	}

	const videoSample = getVideoSample(trakBox);
	if (!videoSample) {
		throw new Error('No video sample');
	}

	const sampleAspectRatio = getSampleAspectRatio(trakBox);

	const applied = applyAspectRatios({
		dimensions: videoSample,
		sampleAspectRatio,
		displayAspectRatio: getDisplayAspectRatio({
			sampleAspectRatio,
			nativeDimensions: videoSample,
		}),
	});

	return {
		type: 'video',
		samplePositions,
		trackId: tkhdBox.trackId,
		description: videoDescriptors,
		timescale: timescaleAndDuration.timescale,
		codecString: getVideoCodecString(trakBox),
		sampleAspectRatio: getSampleAspectRatio(trakBox),
		width: applied.width,
		height: applied.height,
		untransformedWidth: videoSample.width,
		untransformedHeight: videoSample.height,
	} as VideoTrack;
};
