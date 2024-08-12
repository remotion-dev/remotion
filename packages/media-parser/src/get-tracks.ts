import {av1CodecStringToString} from './av1-codec-string';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {MainSegment} from './boxes/webm/segments/main';
import type {
	ClusterSegment,
	TrackEntrySegment,
} from './boxes/webm/segments/track-entry';
import {getAudioCodecStringFromTrak} from './get-audio-codec';
import {
	getTimescaleAndDuration,
	trakBoxContainsAudio,
	trakBoxContainsVideo,
} from './get-fps';
import {
	applyAspectRatios,
	getDisplayAspectRatio,
	getSampleAspectRatio,
	getVideoSample,
} from './get-sample-aspect-ratio';
import type {SamplePosition} from './get-sample-positions';
import {getSamplePositions} from './get-sample-positions';
import {getVideoCodecString} from './get-video-codec';
import type {AnySegment} from './parse-result';
import {
	getCttsBox,
	getFtypBox,
	getMoovBox,
	getMvhdBox,
	getStcoBox,
	getStscBox,
	getStssBox,
	getStszBox,
	getSttsBox,
	getTkhdBox,
	getTraks,
	getVideoDescriptors,
} from './traversal';

type SampleAspectRatio = {
	numerator: number;
	denominator: number;
};

export type VideoTrack = {
	type: 'video';
	samplePositions: SamplePosition[] | null;
	trackId: number;
	description: Uint8Array | null;
	timescale: number;
	codecString: string | null;
	sampleAspectRatio: SampleAspectRatio;
	width: number;
	height: number;
	untransformedWidth: number;
	untransformedHeight: number;
};

export type AudioTrack = {
	type: 'audio';
	samplePositions: SamplePosition[] | null;
	trackId: number;
	timescale: number;
	codecString: string | null;
};

export type Track = VideoTrack | AudioTrack;

// TODO: Use this to determine if all tracks are present
export const getNumberOfTracks = (moovBox: MoovBox): number => {
	const mvHdBox = getMvhdBox(moovBox);
	if (!mvHdBox) {
		return 0;
	}

	return mvHdBox.nextTrackId - 1;
};

export const hasTracks = (segments: AnySegment[]): boolean => {
	const moovBox = getMoovBox(segments);
	const ftypBox = getFtypBox(segments);

	if (!moovBox) {
		if (ftypBox) {
			return false;
		}

		// TODO: Support Matroska
		return true;
	}

	const numberOfTracks = getNumberOfTracks(moovBox);
	const tracks = getTraks(moovBox);

	return tracks.length === numberOfTracks;
};

const getMatroskaVideoCodecString = (
	track: TrackEntrySegment,
	cluster: ClusterSegment | null,
): string => {
	const codec = track.children.find((b) => b.type === 'codec-segment');

	if (!codec || codec.type !== 'codec-segment') {
		throw new Error('Expected codec segment');
	}

	if (codec.codec === 'V_VP8') {
		return 'vp8';
	}

	if (codec.codec === 'V_VP9') {
		return 'vp9';
	}

	if (codec.codec === 'V_MPEG4/ISO/AVC') {
		// TODO: different avc1!
		// Failing test: Should stream MKV video
		return 'avc1';
	}

	if (codec.codec === 'V_AV1') {
		if (!cluster) {
			throw new Error('No cluster segment');
		}

		return av1CodecStringToString({track, clusterSegment: cluster});
	}

	throw new Error(`Unknown codec: ${codec.codec}`);
};

const getMatroskaAudioCodecString = (track: TrackEntrySegment): string => {
	const codec = track.children.find((b) => b.type === 'codec-segment');

	if (!codec || codec.type !== 'codec-segment') {
		throw new Error('Expected codec segment');
	}

	if (codec.codec === 'A_OPUS') {
		return 'opus';
	}

	// TODO: Wrong, see here how to parse it correctly
	if (codec.codec === 'A_PCM/INT/LIT') {
		return 'pcm-s16';
	}

	throw new Error(`Unknown codec: ${codec.codec}`);
};

const getTracksFromMatroska = (
	segment: MainSegment,
): {videoTracks: VideoTrack[]; audioTracks: AudioTrack[]} => {
	const tracksSegment = segment.children.find(
		(b) => b.type === 'tracks-segment',
	);
	if (!tracksSegment || tracksSegment.type !== 'tracks-segment') {
		throw new Error('No tracks segment');
	}

	const infoSegment = segment.children.find((b) => b.type === 'info-segment');

	if (!infoSegment || infoSegment.type !== 'info-segment') {
		throw new Error('No info segment');
	}

	const timescale = infoSegment.children.find(
		(b) => b.type === 'timestamp-scale-segment',
	);

	if (!timescale || timescale.type !== 'timestamp-scale-segment') {
		throw new Error('No timescale segment');
	}

	const clusterSegment = segment.children.find(
		(b) => b.type === 'cluster-segment',
	) as ClusterSegment | undefined;

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];

	for (const track of tracksSegment.children) {
		if (track.type === 'crc32-segment') {
			continue;
		}

		if (track.type !== 'track-entry-segment') {
			throw new Error('Expected track entry segment');
		}

		const trackType = track.children.find(
			(b) => b.type === 'track-type-segment',
		);

		if (!trackType || trackType.type !== 'track-type-segment') {
			throw new Error('Expected track type segment');
		}

		const trackId = track.children.find(
			(b) => b.type === 'track-number-segment',
		);

		if (!trackId || trackId.type !== 'track-number-segment') {
			throw new Error('Expected track id segment');
		}

		if (trackType.trackType === 'video') {
			const videoSegment = track.children.find(
				(b) => b.type === 'video-segment',
			);

			if (!videoSegment || videoSegment.type !== 'video-segment') {
				throw new Error('Expected video segment');
			}

			const width = videoSegment.children.find(
				(b) => b.type === 'width-segment',
			);

			if (!width || width.type !== 'width-segment') {
				throw new Error('Expected width segment');
			}

			const height = videoSegment.children.find(
				(b) => b.type === 'height-segment',
			);

			if (!height || height.type !== 'height-segment') {
				throw new Error('Expected height segment');
			}

			videoTracks.push({
				type: 'video',
				trackId: trackId.trackNumber,
				codecString: getMatroskaVideoCodecString(track, clusterSegment ?? null),
				description: null,
				height: height.height,
				width: width.width,
				sampleAspectRatio: {
					numerator: 1,
					denominator: 1,
				},
				timescale: timescale.timestampScale,
				samplePositions: [],
				untransformedHeight: height.height,
				untransformedWidth: width.width,
			});
		}

		if (trackType.trackType === 'audio') {
			audioTracks.push({
				type: 'audio',
				trackId: trackId.trackNumber,
				codecString: getMatroskaAudioCodecString(track),
				samplePositions: null,
				timescale: timescale.timestampScale,
			});
		}
	}

	return {
		videoTracks,
		audioTracks,
	};
};

export const getTracks = (
	segments: AnySegment[],
): {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
} => {
	const mainSegment = segments.find((s) => s.type === 'main-segment');
	if (mainSegment && mainSegment.type === 'main-segment') {
		return getTracksFromMatroska(mainSegment);
	}

	const moovBox = getMoovBox(segments);
	if (!moovBox) {
		return {
			videoTracks: [],
			audioTracks: [],
		};
	}

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const tracks = getTraks(moovBox);

	for (const track of tracks) {
		const stszBox = getStszBox(track);
		const stcoBox = getStcoBox(track);
		const stscBox = getStscBox(track);
		const stssBox = getStssBox(track);
		const sttsBox = getSttsBox(track);
		const tkhdBox = getTkhdBox(track);
		const cttsBox = getCttsBox(track);
		const videoDescriptors = getVideoDescriptors(track);
		const timescaleAndDuration = getTimescaleAndDuration(track);

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

		if (trakBoxContainsAudio(track)) {
			audioTracks.push({
				type: 'audio',
				samplePositions,
				trackId: tkhdBox.trackId,
				timescale: timescaleAndDuration.timescale,
				codecString: getAudioCodecStringFromTrak(track),
			});
		}

		if (trakBoxContainsVideo(track)) {
			const videoSample = getVideoSample(track);
			if (!videoSample) {
				throw new Error('No video sample');
			}

			const sampleAspectRatio = getSampleAspectRatio(track);

			const applied = applyAspectRatios({
				dimensions: videoSample,
				sampleAspectRatio,
				displayAspectRatio: getDisplayAspectRatio({
					sampleAspectRatio,
					nativeDimensions: videoSample,
				}),
			});

			videoTracks.push({
				type: 'video',
				samplePositions,
				trackId: tkhdBox.trackId,
				description: videoDescriptors,
				timescale: timescaleAndDuration.timescale,
				codecString: getVideoCodecString(track),
				sampleAspectRatio: getSampleAspectRatio(track),
				width: applied.width,
				height: applied.height,
				untransformedWidth: videoSample.width,
				untransformedHeight: videoSample.height,
			});
		}
	}

	return {
		videoTracks,
		audioTracks,
	};
};
