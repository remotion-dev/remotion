import {getArrayBufferIterator} from '../../buffer-iterator';
import type {
	AudioTrack,
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrack,
} from '../../get-tracks';
import {getHvc1CodecString} from '../../make-hvc1-codec-strings';
import {parseAv1PrivateData} from './av1-codec-private';
import {parseColorSegment} from './color';
import {getAudioDescription} from './description';
import type {CodecIdSegment, TrackEntry} from './segments/all-segments';
import {trackTypeToString} from './segments/track-entry';
import {
	getBitDepth,
	getCodecSegment,
	getColourSegment,
	getDisplayHeightSegment,
	getDisplayWidthSegment,
	getHeightSegment,
	getNumberOfChannels,
	getPrivateData,
	getSampleRate,
	getTrackId,
	getTrackTypeSegment,
	getWidthSegment,
} from './traversal';

export const NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS =
	'no-codec-private-should-be-derived-from-sps';

const getDescription = (track: TrackEntry): undefined | Uint8Array => {
	const codec = getCodecSegment(track);
	if (!codec) {
		return undefined;
	}

	if (codec.value === 'V_MPEG4/ISO/AVC' || codec.value === 'V_MPEGH/ISO/HEVC') {
		const priv = getPrivateData(track);
		if (priv) {
			return priv;
		}
	}

	return undefined;
};

const getMatroskaVideoCodecWithoutConfigString = ({
	codecSegment: codec,
}: {
	codecSegment: CodecIdSegment;
}): MediaParserVideoCodec => {
	if (codec.value === 'V_VP8') {
		return 'vp8';
	}

	if (codec.value === 'V_VP9') {
		return 'vp9';
	}

	if (codec.value === 'V_MPEG4/ISO/AVC') {
		return 'h264';
	}

	if (codec.value === 'V_AV1') {
		return 'av1';
	}

	if (codec.value === 'V_MPEGH/ISO/HEVC') {
		return 'h265';
	}

	throw new Error(`Unknown codec: ${codec.value}`);
};

const getMatroskaVideoCodecString = ({
	track,
	codecSegment: codec,
}: {
	track: TrackEntry;
	codecSegment: CodecIdSegment;
}): string | null => {
	if (codec.value === 'V_VP8') {
		return 'vp8';
	}

	if (codec.value === 'V_VP9') {
		const priv = getPrivateData(track);
		if (priv) {
			throw new Error(
				'@remotion/media-parser cannot handle the private data for VP9. Do you have an example file you could send so we can implement it? https://remotion.dev/report',
			);
		}

		return 'vp09.00.10.08';
	}

	if (codec.value === 'V_MPEG4/ISO/AVC') {
		const priv = getPrivateData(track);
		if (priv) {
			return `avc1.${priv[1].toString(16).padStart(2, '0')}${priv[2].toString(16).padStart(2, '0')}${priv[3].toString(16).padStart(2, '0')}`;
		}

		return NO_CODEC_PRIVATE_SHOULD_BE_DERIVED_FROM_SPS;
	}

	if (codec.value === 'V_MPEGH/ISO/HEVC') {
		const priv = getPrivateData(track);
		const iterator = getArrayBufferIterator(
			priv as Uint8Array,
			(priv as Uint8Array).length,
		);

		return 'hvc1.' + getHvc1CodecString(iterator);
	}

	if (codec.value === 'V_AV1') {
		const priv = getPrivateData(track);

		if (!priv) {
			throw new Error('Expected private data in AV1 track');
		}

		return parseAv1PrivateData(priv, null);
	}

	throw new Error(`Unknown codec: ${codec.value}`);
};

export const getMatroskaAudioCodecWithoutConfigString = ({
	track,
}: {
	track: TrackEntry;
}): MediaParserAudioCodec => {
	const codec = getCodecSegment(track);
	if (!codec) {
		throw new Error('Expected codec segment');
	}

	if (codec.value === 'A_OPUS') {
		return 'opus';
	}

	if (codec.value === 'A_VORBIS') {
		return 'vorbis';
	}

	if (codec.value === 'A_PCM/INT/LIT') {
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
			return 'pcm-s16';
		}

		if (bitDepth === 24) {
			return 'pcm-s24';
		}

		throw new Error('Unknown audio format');
	}

	if (codec.value === 'A_AAC') {
		return `aac`;
	}

	if (codec.value === 'A_MPEG/L3') {
		return 'mp3';
	}

	throw new Error(`Unknown codec: ${codec.value}`);
};

const getMatroskaAudioCodecString = (track: TrackEntry): string => {
	const codec = getCodecSegment(track);
	if (!codec) {
		throw new Error('Expected codec segment');
	}

	if (codec.value === 'A_OPUS') {
		return 'opus';
	}

	if (codec.value === 'A_VORBIS') {
		return 'vorbis';
	}

	if (codec.value === 'A_PCM/INT/LIT') {
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

	if (codec.value === 'A_AAC') {
		const priv = getPrivateData(track);

		const iterator = getArrayBufferIterator(
			priv as Uint8Array,
			(priv as Uint8Array).length,
		);

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

	if (codec.value === 'A_MPEG/L3') {
		return 'mp3';
	}

	throw new Error(`Unknown codec: ${codec.value}`);
};

export const getTrack = ({
	timescale,
	track,
}: {
	timescale: number;
	track: TrackEntry;
}): VideoTrack | AudioTrack | null => {
	const trackType = getTrackTypeSegment(track);

	if (!trackType) {
		throw new Error('Expected track type segment');
	}

	const trackId = getTrackId(track);

	if (trackTypeToString(trackType.value.value) === 'video') {
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

		const codecPrivate = getPrivateData(track);
		const codecString = getMatroskaVideoCodecString({
			track,
			codecSegment: codec,
		});
		const colour = getColourSegment(track);

		if (!codecString) {
			return null;
		}

		return {
			type: 'video',
			trackId,
			codec: codecString,
			description: getDescription(track),
			height: displayHeight ? displayHeight.value.value : height.value.value,
			width: displayWidth ? displayWidth.value.value : width.value.value,
			sampleAspectRatio: {
				numerator: 1,
				denominator: 1,
			},
			timescale,
			codedHeight: height.value.value,
			codedWidth: width.value.value,
			displayAspectHeight: displayHeight
				? displayHeight.value.value
				: height.value.value,
			displayAspectWidth: displayWidth
				? displayWidth.value.value
				: width.value.value,
			rotation: 0,
			trakBox: null,
			codecPrivate,
			color: colour
				? parseColorSegment(colour)
				: {
						fullRange: null,
						matrixCoefficients: null,
						primaries: null,
						transferCharacteristics: null,
					},
			codecWithoutConfig: getMatroskaVideoCodecWithoutConfigString({
				codecSegment: codec,
			}),
			fps: null,
		};
	}

	if (trackTypeToString(trackType.value.value) === 'audio') {
		const sampleRate = getSampleRate(track);
		const numberOfChannels = getNumberOfChannels(track);
		const codecPrivate = getPrivateData(track);
		if (sampleRate === null) {
			throw new Error('Could not find sample rate or number of channels');
		}

		return {
			type: 'audio',
			trackId,
			codec: getMatroskaAudioCodecString(track),
			timescale,
			numberOfChannels,
			sampleRate,
			description: getAudioDescription(track),
			trakBox: null,
			codecPrivate,
			codecWithoutConfig: getMatroskaAudioCodecWithoutConfigString({
				track,
			}),
		};
	}

	return null;
};
