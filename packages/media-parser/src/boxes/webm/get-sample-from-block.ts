import {getArrayBufferIterator} from '../../buffer-iterator';
import type {ParserContext} from '../../parser-context';
import type {AudioSample, VideoSample} from '../../webcodec-sample-types';
import type {BlockSegment, SimpleBlockSegment} from './segments/all-segments';
import {matroskaElements} from './segments/all-segments';
import {parseBlockFlags} from './segments/block-simple-block-flags';

type SampleResult =
	| {
			type: 'video-sample';
			videoSample: VideoSample;
	  }
	| {
			type: 'audio-sample';
			audioSample: AudioSample;
	  }
	| {
			type: 'partial-video-sample';
			partialVideoSample: Omit<VideoSample, 'type'>;
	  }
	| {
			type: 'no-sample';
	  };

export const getSampleFromBlock = (
	ebml: BlockSegment | SimpleBlockSegment,
	parserContext: ParserContext,
	offset: number,
): SampleResult => {
	const iterator = getArrayBufferIterator(ebml.value);
	const trackNumber = iterator.getVint();
	if (trackNumber === null) {
		throw new Error('Not enough data to get track number, should not happen');
	}

	const timecodeRelativeToCluster = iterator.getUint16();

	const {keyframe} = parseBlockFlags(iterator, matroskaElements.Block);

	const {codec, trackTimescale} =
		parserContext.parserState.getTrackInfoByNumber(trackNumber);

	const clusterOffset =
		parserContext.parserState.getTimestampOffsetForByteOffset(offset);

	const timescale = parserContext.parserState.getTimescale();

	if (clusterOffset === undefined) {
		throw new Error('Could not find offset for byte offset ' + offset);
	}

	// https://github.com/hubblec4/Matroska-Chapters-Specs/blob/master/notes.md/#timestampscale
	// The TimestampScale Element is used to calculate the Raw Timestamp of a Block. The timestamp is obtained by adding the Block's timestamp to the Cluster's Timestamp Element, and then multiplying that result by the TimestampScale. The result will be the Block's Raw Timestamp in nanoseconds.
	const timecodeInNanoSeconds =
		(timecodeRelativeToCluster + clusterOffset) *
		timescale *
		(trackTimescale ?? 1);

	// Timecode should be in microseconds
	const timecodeInMicroseconds = timecodeInNanoSeconds / 1000;

	if (!codec) {
		throw new Error('Could not find codec for track ' + trackNumber);
	}

	const remainingNow = ebml.value.length - (iterator.counter.getOffset() - 0);

	if (codec.startsWith('V_')) {
		const partialVideoSample: Omit<VideoSample, 'type'> = {
			data: iterator.getSlice(remainingNow),
			cts: null,
			dts: null,
			duration: undefined,
			trackId: trackNumber,
			timestamp: timecodeInMicroseconds,
		};

		if (keyframe === null) {
			return {
				type: 'partial-video-sample',
				partialVideoSample,
			};
		}

		const sample: VideoSample = {
			...partialVideoSample,
			type: keyframe ? 'key' : 'delta',
		};

		return {
			type: 'video-sample',
			videoSample: sample,
		};
	}

	if (codec.startsWith('A_')) {
		return {
			type: 'audio-sample',
			audioSample: {
				data: iterator.getSlice(remainingNow),
				trackId: trackNumber,
				timestamp: timecodeInMicroseconds,
				type: 'key',
			},
		};
	}

	return {
		type: 'no-sample',
	};
};
