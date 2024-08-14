import {getArrayBufferIterator} from '../../buffer-iterator';
import type {AudioTrack, VideoTrack} from '../../get-tracks';
import {getHvc1CodecString} from '../../make-hvc1-codec-strings';
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

	if (codec.codec === 'V_MPEG4/ISO/AVC' || codec.codec === 'V_MPEGH/ISO/HEVC') {
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
				'@remotion/media-parser cannot handle the private data for VP9. Do you have an example file you could send so we can implement it?',
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

	if (codec.codec === 'V_MPEGH/ISO/HEVC') {
		const priv = getPrivateData(track);
		const iterator = getArrayBufferIterator(priv as Uint8Array);

		return 'hvc1.' + getHvc1CodecString(iterator);
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

		return 'pcm-s' + bitDepth;
	}

	if (codec.codec === 'A_AAC') {
		const priv = getPrivateData(track);

		const iterator = getArrayBufferIterator(priv as Uint8Array);

		iterator.startReadingBits();
		/**
		 * ChatGPT
		 * 	▪	The first 5 bits represent the AOT.
				▪	Common values:
				◦	1 for AAC Main
				◦	2 for AAC LC (Low Complexity)
				◦	3 for AAC SSR (Scalable Sample Rate)
				◦	4 for AAC LTP (Long Term Prediction)
				◦	5 for SBR (Spectral Band Replication)
				◦	29 for HE-AAC (which uses SBR with AAC LC)
		 */
		/** 
		 * Fully qualified codec: 
		 * This codec has multiple possible codec strings:
			"mp4a.40.2" — MPEG-4 AAC LC
			"mp4a.40.02" — MPEG-4 AAC LC, leading 0 for Aud-OTI compatibility
			"mp4a.40.5" — MPEG-4 HE-AAC v1 (AAC LC + SBR)
			"mp4a.40.05" — MPEG-4 HE-AAC v1 (AAC LC + SBR), leading 0 for Aud-OTI compatibility
			"mp4a.40.29" — MPEG-4 HE-AAC v2 (AAC LC + SBR + PS)
			"mp4a.67" — MPEG-2 AAC LC
		*/

		const profile = iterator.getBits(5);
		iterator.stopReadingBits();
		iterator.destroy();

		return `mp4a.40.${profile.toString().padStart(2, '0')}`;
	}

	if (codec.codec === 'A_MPEG/L3') {
		return 'mp3';
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
			displayAspectHeight: displayHeight
				? displayHeight.displayHeight
				: height.height,
			displayAspectWidth: displayWidth
				? displayWidth.displayWidth
				: width.width,
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
