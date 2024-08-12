import {av1CodecStringToString} from '../../av1-codec-string';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {
	getClusterSegment,
	getHeightSegment,
	getTimescaleSegment,
	getTrackId,
	getTrackTypeSegment,
	getTracksSegment,
	getWidthSegment,
} from '../../traversal';
import type {MainSegment} from './segments/main';
import type {ClusterSegment, TrackEntrySegment} from './segments/track-entry';

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

export const getTracksFromMatroska = (
	segment: MainSegment,
): {videoTracks: VideoTrack[]; audioTracks: AudioTrack[]} => {
	const tracksSegment = getTracksSegment(segment);
	if (!tracksSegment) {
		throw new Error('No tracks segment');
	}

	const timescale = getTimescaleSegment(segment);

	if (!timescale) {
		throw new Error('No timescale segment');
	}

	const clusterSegment = getClusterSegment(segment);

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];

	for (const track of tracksSegment.children) {
		if (track.type === 'crc32-segment') {
			continue;
		}

		if (track.type !== 'track-entry-segment') {
			throw new Error('Expected track entry segment');
		}

		const trackType = getTrackTypeSegment(track);

		if (!trackType) {
			throw new Error('Expected track type segment');
		}

		const trackId = getTrackId(track);

		if (trackType.trackType === 'video') {
			const width = getWidthSegment(track);

			if (width === null) {
				throw new Error('Expected width segment');
			}

			const height = getHeightSegment(track);

			if (height === null) {
				throw new Error('Expected height segment');
			}

			videoTracks.push({
				type: 'video',
				trackId,
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
				trackId,
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
