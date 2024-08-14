import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {
	getBitDepth,
	getCodecSegment,
	getDisplayHeightSegment,
	getDisplayWidthSegment,
	getHeightSegment,
	getNumberOfChannels,
	getPrivateData,
	getSampleRate,
	getTrackId,
	getTrackTypeSegment,
	getWidthSegment,
} from '../../traversal';
import {parseAv1PrivateData} from './av1-codec-private';
import {getAudioDescription} from './description';
import type {CodecSegment, TrackEntrySegment} from './segments/track-entry';

const getDescription = (track: TrackEntrySegment): undefined | Uint8Array => {
	const codec = getCodecSegment(track);
	if (!codec) {
		return undefined;
	}

	if (codec.codec === 'V_MPEG4/ISO/AVC') {
		const priv = getPrivateData(track);
		if (priv) {
			return priv;
		}
	}

	return undefined;
};

const getMatroskaVideoCodecString = ({
	track,
	codecSegment: codec,
}: {
	track: TrackEntrySegment;
	codecSegment: CodecSegment;
}): string | null => {
	if (codec.codec === 'V_VP8') {
		return 'vp8';
	}

	if (codec.codec === 'V_VP9') {
		const priv = getPrivateData(track);
		if (priv) {
			throw new Error(
				'Private data is not implemented for VP9. Do you have an example file?',
			);
		}

		return 'vp09.00.10.08';
	}

	if (codec.codec === 'V_MPEG4/ISO/AVC') {
		const priv = getPrivateData(track);
		if (priv) {
			return `avc1.${priv[1].toString(16).padStart(2, '0')}${priv[2].toString(16).padStart(2, '0')}${priv[3].toString(16).padStart(2, '0')}`;
		}

		throw new Error('Could not find a CodecPrivate field in TrackEntry');
	}

	if (codec.codec === 'V_AV1') {
		const priv = getPrivateData(track);

		if (!priv) {
			throw new Error('Expected private data in AV1 track');
		}

		return parseAv1PrivateData(priv, null);
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

	if (codec.codec === 'A_PCM/INT/LIT') {
		// https://github.com/ietf-wg-cellar/matroska-specification/issues/142#issuecomment-330004950
		// Audio samples MUST be considered as signed values, except if the audio bit depth is 8 which MUST be interpreted as unsigned values.

		const bitDepth = getBitDepth(track);
		if (bitDepth === null) {
			throw new Error('Expected bit depth');
		}

		if (bitDepth === 8) {
			return 'pcm-u8';
		}

		if (bitDepth === 16) {
			return 'pcm-s' + bitDepth;
		}
	}

	throw new Error(`Unknown codec: ${codec.codec}`);
};

export const getTrack = ({
	timescale,
	track,
}: {
	timescale: number;
	track: TrackEntrySegment;
}): VideoTrack | AudioTrack | null => {
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

		const displayHeight = getDisplayHeightSegment(track);
		const displayWidth = getDisplayWidthSegment(track);

		const codec = getCodecSegment(track);
		if (!codec) {
			return null;
		}

		const codecString = getMatroskaVideoCodecString({
			track,
			codecSegment: codec,
		});

		if (!codecString) {
			return null;
		}

		return {
			type: 'video',
			trackId,
			codec: codecString,
			description: getDescription(track),
			height: displayHeight ? displayHeight.displayHeight : height.height,
			width: displayWidth ? displayWidth.displayWidth : width.width,
			sampleAspectRatio: {
				numerator: 1,
				denominator: 1,
			},
			timescale,
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
			timescale,
			numberOfChannels,
			sampleRate,
			description: getAudioDescription(track),
		};
	}

	return null;
};
