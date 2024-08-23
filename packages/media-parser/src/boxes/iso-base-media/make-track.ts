import {
	getAudioCodecStringFromTrak,
	getNumberOfChannelsFromTrak,
	getSampleRate,
} from '../../get-audio-codec';
import {
	getTimescaleAndDuration,
	trakBoxContainsAudio,
	trakBoxContainsVideo,
} from '../../get-fps';
import {
	applyAspectRatios,
	applyTkhdBox,
	getDisplayAspectRatio,
	getSampleAspectRatio,
	getVideoSample,
} from '../../get-sample-aspect-ratio';
import {getSamplePositions} from '../../get-sample-positions';
import type {AudioTrack, OtherTrack, VideoTrack} from '../../get-tracks';
import {getVideoCodecString} from '../../get-video-codec';
import type {AnySegment} from '../../parse-result';
import {getSamplesFromMoof} from '../../samples-from-moof';
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
	moofBox: AnySegment | null,
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

	let samplePositions = getSamplePositions({
		stcoBox,
		stscBox,
		stszBox,
		stssBox,
		sttsBox,
		cttsBox,
	});

	if (samplePositions.length === 0 && moofBox) {
		samplePositions = getSamplesFromMoof({moofBox, trackId: tkhdBox.trackId});
	}

	if (trakBoxContainsAudio(trakBox)) {
		const numberOfChannels = getNumberOfChannelsFromTrak(trakBox);
		if (numberOfChannels === null) {
			throw new Error('Could not find number of channels');
		}

		const sampleRate = getSampleRate(trakBox);
		if (sampleRate === null) {
			throw new Error('Could not find sample rate');
		}

		const {codecString, description} = getAudioCodecStringFromTrak(trakBox);

		return {
			type: 'audio',
			samplePositions,
			trackId: tkhdBox.trackId,
			timescale: timescaleAndDuration.timescale,
			codec: codecString,
			numberOfChannels,
			sampleRate,
			description,
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

	const aspectRatioApplied = applyAspectRatios({
		dimensions: videoSample,
		sampleAspectRatio,
		displayAspectRatio: getDisplayAspectRatio({
			sampleAspectRatio,
			nativeDimensions: videoSample,
		}),
	});

	const {displayAspectHeight, displayAspectWidth, height, rotation, width} =
		applyTkhdBox(aspectRatioApplied, tkhdBox);

	const codec = getVideoCodecString(trakBox);

	if (!codec) {
		throw new Error('Could not find video codec');
	}

	const track: VideoTrack = {
		type: 'video',
		samplePositions,
		trackId: tkhdBox.trackId,
		description: videoDescriptors ?? undefined,
		timescale: timescaleAndDuration.timescale,
		codec,
		sampleAspectRatio: getSampleAspectRatio(trakBox),
		width,
		height,
		codedWidth: videoSample.width,
		codedHeight: videoSample.height,
		// Repeating those keys because they get picked up by VideoDecoder
		displayAspectWidth,
		displayAspectHeight,
		rotation,
	};
	return track;
};
