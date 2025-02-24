import {getArrayBufferIterator} from '../../buffer-iterator';
import type {ParserState} from '../../state/parser-state';
import type {AudioOrVideoSample} from '../../webcodec-sample-types';
import {parseAvc} from '../avc/parse-avc';
import {getTracksFromMatroska} from './get-ready-tracks';
import type {BlockSegment, SimpleBlockSegment} from './segments/all-segments';
import {matroskaElements} from './segments/all-segments';
import {parseBlockFlags} from './segments/block-simple-block-flags';

type SampleResult =
	| {
			type: 'video-sample';
			videoSample: AudioOrVideoSample;
	  }
	| {
			type: 'audio-sample';
			audioSample: AudioOrVideoSample;
	  }
	| {
			type: 'partial-video-sample';
			partialVideoSample: Omit<AudioOrVideoSample, 'type'>;
	  }
	| {
			type: 'no-sample';
	  };

const addAvcToTrackIfNecessary = ({
	partialVideoSample,
	codec,
	state,
	trackNumber,
}: {
	partialVideoSample: Omit<AudioOrVideoSample, 'type'>;
	codec: string;
	state: ParserState;
	trackNumber: number;
}) => {
	if (
		codec === 'V_MPEG4/ISO/AVC' &&
		getTracksFromMatroska({state}).missingInfo.length > 0
	) {
		const parsed = parseAvc(partialVideoSample.data);
		for (const parse of parsed) {
			if (parse.type === 'avc-profile') {
				state.webm.setAvcProfileForTrackNumber(trackNumber, parse);
			}
		}
	}
};

export const getSampleFromBlock = (
	ebml: BlockSegment | SimpleBlockSegment,
	state: ParserState,
	offset: number,
): SampleResult => {
	const iterator = getArrayBufferIterator(ebml.value, ebml.value.length);
	const trackNumber = iterator.getVint();
	if (trackNumber === null) {
		throw new Error('Not enough data to get track number, should not happen');
	}

	const timecodeRelativeToCluster = iterator.getInt16();

	const {keyframe} = parseBlockFlags(
		iterator,
		ebml.type === 'SimpleBlock'
			? matroskaElements.SimpleBlock
			: matroskaElements.Block,
	);

	const {codec, trackTimescale} = state.webm.getTrackInfoByNumber(trackNumber);

	const clusterOffset = state.webm.getTimestampOffsetForByteOffset(offset);

	const timescale = state.webm.getTimescale();

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
		throw new Error(`Could not find codec for track ${trackNumber}`);
	}

	const remainingNow = ebml.value.length - iterator.counter.getOffset();

	if (codec.startsWith('V_')) {
		const partialVideoSample: Omit<AudioOrVideoSample, 'type'> = {
			data: iterator.getSlice(remainingNow),
			cts: timecodeInMicroseconds,
			dts: timecodeInMicroseconds,
			duration: undefined,
			trackId: trackNumber,
			timestamp: timecodeInMicroseconds,
			offset,
			timescale,
		};

		if (keyframe === null) {
			iterator.destroy();

			return {
				type: 'partial-video-sample',
				partialVideoSample,
			};
		}

		addAvcToTrackIfNecessary({
			codec,
			partialVideoSample,
			state,
			trackNumber,
		});

		const sample: AudioOrVideoSample = {
			...partialVideoSample,
			type: keyframe ? 'key' : 'delta',
		};

		iterator.destroy();

		return {
			type: 'video-sample',
			videoSample: sample,
		};
	}

	if (codec.startsWith('A_')) {
		const audioSample: AudioOrVideoSample = {
			data: iterator.getSlice(remainingNow),
			trackId: trackNumber,
			timestamp: timecodeInMicroseconds,
			type: 'key',
			duration: undefined,
			cts: timecodeInMicroseconds,
			dts: timecodeInMicroseconds,
			offset,
			timescale,
		};

		iterator.destroy();

		return {
			type: 'audio-sample',
			audioSample,
		};
	}

	iterator.destroy();
	return {
		type: 'no-sample',
	};
};
