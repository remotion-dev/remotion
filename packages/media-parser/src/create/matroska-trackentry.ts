import {makeMatroskaColorBytes} from '../boxes/webm/color';
import {makeMatroskaBytes, padMatroskaBytes} from '../boxes/webm/make-header';
import type {
	BytesAndOffset,
	PossibleEbmlOrUint8Array,
} from '../boxes/webm/segments/all-segments';
import type {
	MediaParserAudioCodec,
	MediaParserVideoCodec,
	VideoTrackColorParams,
} from '../get-tracks';

export const makeMatroskaVideoBytes = ({
	color,
	width,
	height,
}: {
	color: VideoTrackColorParams;
	width: number;
	height: number;
}) => {
	return makeMatroskaBytes({
		type: 'Video',
		value: [
			{
				type: 'PixelWidth',
				value: {
					value: width,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'PixelHeight',
				value: {
					value: height,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'FlagInterlaced',
				value: {
					// https://datatracker.ietf.org/doc/draft-ietf-cellar-matroska/
					// 5.1.4.1.28.1.
					value: 2, // 2 - progressive, no interlaced
					byteLength: null,
				},
				minVintWidth: null,
			},
			makeMatroskaColorBytes(color),
		],
		minVintWidth: null,
	});
};

export type MakeTrackAudio = {
	trackNumber: number;
	codec: MediaParserAudioCodec;
	numberOfChannels: number;
	sampleRate: number;
	type: 'audio';
	codecPrivate: Uint8Array | null;
};

export type MakeTrackVideo = {
	color: VideoTrackColorParams;
	width: number;
	height: number;
	trackNumber: number;
	codec: MediaParserVideoCodec;
	type: 'video';
	codecPrivate: Uint8Array | null;
};

const makeVideoCodecId = (codecId: MediaParserVideoCodec) => {
	if (codecId === 'vp8') {
		return 'V_VP8';
	}

	if (codecId === 'vp9') {
		return 'V_VP9';
	}

	if (codecId === 'h264') {
		return 'V_MPEG4/ISO/AVC';
	}

	if (codecId === 'av1') {
		return 'V_AV1';
	}

	if (codecId === 'h265') {
		return 'V_MPEGH/ISO/HEVC';
	}

	if (codecId === 'prores') {
		return 'V_PRORES';
	}

	throw new Error(`Unknown codec: ${codecId satisfies never}`);
};

const makeAudioCodecId = (codecId: MediaParserAudioCodec) => {
	if (codecId === 'opus') {
		return 'A_OPUS';
	}

	if (codecId === 'aac') {
		return 'A_AAC';
	}

	if (codecId === 'mp3') {
		return 'A_MPEG/L3';
	}

	if (codecId === 'vorbis') {
		return 'A_VORBIS';
	}

	if (codecId === 'pcm-u8') {
		return 'A_PCM/INT/LIT';
	}

	if (codecId === 'pcm-s16') {
		return 'A_PCM/INT/LIT';
	}

	if (codecId === 'pcm-s24') {
		return 'A_PCM/INT/LIT';
	}

	if (codecId === 'pcm-s32') {
		return 'A_PCM/INT/LIT';
	}

	if (codecId === 'pcm-f32') {
		return 'A_PCM/INT/LIT';
	}

	if (codecId === 'aiff') {
		throw new Error('aiff is not supported in Matroska');
	}

	throw new Error(`Unknown codec: ${codecId satisfies never}`);
};

export const makeMatroskaAudioTrackEntryBytes = ({
	trackNumber,
	codec,
	numberOfChannels,
	sampleRate,
	codecPrivate,
}: MakeTrackAudio) => {
	return makeMatroskaBytes({
		type: 'TrackEntry',
		minVintWidth: null,
		value: [
			{
				type: 'TrackNumber',
				value: {
					value: trackNumber,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'TrackUID',
				value: '0x188FEB95C8EFABA',
				minVintWidth: null,
			},
			{
				type: 'TrackType',
				value: {
					value: 2,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'TrackTimestampScale',
				value: {
					value: 1,
					size: '64',
				},
				minVintWidth: null,
			},
			{
				type: 'CodecID',
				value: makeAudioCodecId(codec),
				minVintWidth: null,
			},
			{
				type: 'Audio',
				value: [
					{
						type: 'Channels',
						minVintWidth: null,
						value: {
							value: numberOfChannels,
							byteLength: null,
						},
					},
					{
						type: 'SamplingFrequency',
						minVintWidth: null,
						value: {
							value: sampleRate,
							size: '64',
						},
					},
					{
						type: 'BitDepth',
						minVintWidth: null,
						value: {
							value: 32,
							byteLength: null,
						},
					},
				],
				minVintWidth: null,
			},
			codecPrivate
				? {
						type: 'CodecPrivate',
						minVintWidth: null,
						value: codecPrivate,
					}
				: null,
		].filter(Boolean) as PossibleEbmlOrUint8Array[],
	});
};

export const makeMatroskaVideoTrackEntryBytes = ({
	color,
	width,
	height,
	trackNumber,
	codec,
	codecPrivate,
}: MakeTrackVideo) => {
	return makeMatroskaBytes({
		type: 'TrackEntry',
		minVintWidth: null,
		value: [
			{
				type: 'TrackNumber',
				value: {
					value: trackNumber,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'TrackUID',
				value: '0xab2171012bb9020a',
				minVintWidth: null,
			},
			{
				type: 'FlagLacing',
				value: {
					value: 0,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'Language',
				value: 'und',
				minVintWidth: null,
			},
			{
				type: 'FlagDefault',
				value: {
					value: 0,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'CodecID',
				value: makeVideoCodecId(codec),
				minVintWidth: null,
			},
			{
				type: 'TrackType',
				value: {
					value: 1, // 'video'
					byteLength: null,
				},
				minVintWidth: null,
			},
			makeMatroskaVideoBytes({
				color,
				width,
				height,
			}),
			codecPrivate
				? {
						type: 'CodecPrivate',
						minVintWidth: null,
						value: codecPrivate,
					}
				: null,
		].filter(Boolean) as PossibleEbmlOrUint8Array[],
	});
};

export const makeMatroskaTracks = (tracks: BytesAndOffset[]) => {
	return padMatroskaBytes(
		makeMatroskaBytes({
			type: 'Tracks',
			value: tracks,
			minVintWidth: null,
		}),
		500,
	);
};
