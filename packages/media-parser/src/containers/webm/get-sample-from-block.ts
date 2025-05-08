import {getArrayBufferIterator} from '../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../log';
import {registerVideoTrack} from '../../register-track';
import type {WebmState} from '../../state/matroska/webm';
import type {CallbacksState} from '../../state/sample-callbacks';
import type {StructureState} from '../../state/structure';
import type {
	MediaParserAudioSample,
	MediaParserOnVideoTrack,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';
import {parseAvc} from '../avc/parse-avc';
import {getTracksFromMatroska} from './get-ready-tracks';
import type {BlockSegment, SimpleBlockSegment} from './segments/all-segments';
import {matroskaElements} from './segments/all-segments';
import {parseBlockFlags} from './segments/block-simple-block-flags';

type SampleResult =
	| {
			type: 'video-sample';
			videoSample: MediaParserVideoSample;
	  }
	| {
			type: 'audio-sample';
			audioSample: MediaParserAudioSample;
	  }
	| {
			type: 'partial-video-sample';
			partialVideoSample: Omit<MediaParserVideoSample, 'type'>;
	  }
	| {
			type: 'no-sample';
	  };

const addAvcToTrackAndActivateTrackIfNecessary = async ({
	partialVideoSample,
	codec,
	structureState,
	webmState,
	trackNumber,
	logLevel,
	callbacks,
	onVideoTrack,
}: {
	partialVideoSample: Omit<MediaParserVideoSample, 'type'>;
	codec: string;
	structureState: StructureState;
	webmState: WebmState;
	trackNumber: number;
	logLevel: MediaParserLogLevel;
	callbacks: CallbacksState;
	onVideoTrack: MediaParserOnVideoTrack | null;
}) => {
	if (codec !== 'V_MPEG4/ISO/AVC') {
		return;
	}

	const missingTracks = getTracksFromMatroska({
		structureState,
		webmState,
	}).missingInfo;

	if (missingTracks.length === 0) {
		return;
	}

	const parsed = parseAvc(partialVideoSample.data);
	for (const parse of parsed) {
		if (parse.type === 'avc-profile') {
			webmState.setAvcProfileForTrackNumber(trackNumber, parse);
			const track = missingTracks.find((t) => t.trackId === trackNumber);
			if (!track) {
				throw new Error('Could not find track ' + trackNumber);
			}

			const resolvedTracks = getTracksFromMatroska({
				structureState,
				webmState,
			}).resolved;
			const resolvedTrack = resolvedTracks.find(
				(t) => t.trackId === trackNumber,
			);
			if (!resolvedTrack) {
				throw new Error('Could not find track ' + trackNumber);
			}

			await registerVideoTrack({
				track: resolvedTrack,
				container: 'webm',
				logLevel,
				onVideoTrack,
				registerVideoSampleCallback: callbacks.registerVideoSampleCallback,
				tracks: callbacks.tracks,
			});
		}
	}
};

export const getSampleFromBlock = async ({
	ebml,
	webmState,
	offset,
	structureState,
	callbacks,
	logLevel,
	onVideoTrack,
}: {
	ebml: BlockSegment | SimpleBlockSegment;
	webmState: WebmState;
	offset: number;
	structureState: StructureState;
	callbacks: CallbacksState;
	logLevel: MediaParserLogLevel;
	onVideoTrack: MediaParserOnVideoTrack | null;
}): Promise<SampleResult> => {
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

	const {codec, trackTimescale} = webmState.getTrackInfoByNumber(trackNumber);

	const clusterOffset = webmState.getTimestampOffsetForByteOffset(offset);

	const timescale = webmState.getTimescale();

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
		const partialVideoSample: Omit<MediaParserVideoSample, 'type'> = {
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

		await addAvcToTrackAndActivateTrackIfNecessary({
			codec,
			partialVideoSample,
			structureState,
			webmState,
			trackNumber,
			callbacks,
			logLevel,
			onVideoTrack,
		});

		const sample: MediaParserVideoSample = {
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
		const audioSample: MediaParserAudioSample = {
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
