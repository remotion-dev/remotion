import {av1CodecStringToString} from '../../av1-codec-string';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {
	getCodecSegment,
	getHeightSegment,
	getNumberOfChannels,
	getPrivateData,
	getSampleRate,
	getTimescaleSegment,
	getTrackId,
	getTrackTypeSegment,
	getWidthSegment,
} from '../../traversal';
import {getAudioDescription} from './description';
import type {MainSegment} from './segments/main';
import type {
	ClusterSegment,
	CodecSegment,
	TrackEntrySegment,
} from './segments/track-entry';

const getMatroskaVideoCodecString = ({
	track,
	cluster,
	codecSegment: codec,
}: {
	track: TrackEntrySegment;
	cluster: ClusterSegment | null;
	codecSegment: CodecSegment;
}): string | null => {
	if (codec.codec === 'V_VP8') {
		return 'vp8';
	}

	if (codec.codec === 'V_VP9') {
		return 'vp9';
	}

	if (codec.codec === 'V_MPEG4/ISO/AVC') {
		const priv = getPrivateData(track);
		if (priv) {
			return `avc1.${priv[1].toString(16).padStart(2, '0')}${priv[2].toString(16).padStart(2, '0')}${priv[3].toString(16).padStart(2, '0')}`;
		}

		throw new Error('Could not find a CodecPrivate field in TrackEntry');
	}

	if (codec.codec === 'V_AV1') {
		if (!cluster) {
			return null;
		}

		return av1CodecStringToString({track, clusterSegment: cluster});
	}

	throw new Error(`Unknown codec: ${codec.codec}`);
};

const getMatroskaAudioCodecString = (track: TrackEntrySegment): string => {
	const codec = getCodecSegment(track);
	if (!codec) {
		throw new Error('Expected codec segment');
	}

	if (codec.codec === 'A_OPUS') {
		return 'opus';
	}

	if (codec.codec === 'A_VORBIS') {
		return 'vorbis';
	}

	// TODO: Wrong, see here how to parse it correctly
	if (codec.codec === 'A_PCM/INT/LIT') {
		return 'pcm-s16';
	}

	throw new Error(`Unknown codec: ${codec.codec}`);
};

export const getTrack = ({
	mainSegment,
	track,
	clusterSegment,
}: {
	mainSegment: MainSegment;
	track: TrackEntrySegment;
	clusterSegment: ClusterSegment | null;
}): VideoTrack | AudioTrack | null => {
	const trackType = getTrackTypeSegment(track);

	if (!trackType) {
		throw new Error('Expected track type segment');
	}

	const trackId = getTrackId(track);

	const timescale = getTimescaleSegment(mainSegment);

	if (!timescale) {
		throw new Error('No timescale segment');
	}

	if (trackType.trackType === 'video') {
		const width = getWidthSegment(track);

		if (width === null) {
			throw new Error('Expected width segment');
		}

		const height = getHeightSegment(track);

		if (height === null) {
			throw new Error('Expected height segment');
		}

		const codec = getCodecSegment(track);
		if (!codec) {
			return null;
		}

		const codecString = getMatroskaVideoCodecString({
			track,
			cluster: clusterSegment ?? null,
			codecSegment: codec,
		});

		if (!codecString) {
			return null;
		}

		return {
			type: 'video',
			trackId,
			codec: codecString,
			description: undefined,
			height: height.height,
			width: width.width,
			sampleAspectRatio: {
				numerator: 1,
				denominator: 1,
			},
			timescale: timescale.timestampScale,
			samplePositions: [],
			codedHeight: height.height,
			codedWidth: width.width,
		};
	}

	if (trackType.trackType === 'audio') {
		const sampleRate = getSampleRate(track);
		const numberOfChannels = getNumberOfChannels(track);
		if (sampleRate === null) {
			throw new Error('Could not find sample rate or number of channels');
		}

		return {
			type: 'audio',
			trackId,
			codec: getMatroskaAudioCodecString(track),
			samplePositions: null,
			timescale: timescale.timestampScale,
			numberOfChannels,
			sampleRate,
			description: getAudioDescription(track),
		};
	}

	return null;
};
