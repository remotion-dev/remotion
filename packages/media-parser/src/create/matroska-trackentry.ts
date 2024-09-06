import {makeMatroskaColorBytes} from '../boxes/webm/color';
import {makeMatroskaBytes, padMatroskaBytes} from '../boxes/webm/make-header';
import type {
	BytesAndOffset,
	PossibleEbmlOrUint8Array,
} from '../boxes/webm/segments/all-segments';
import type {VideoTrackColorParams} from '../get-tracks';

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
	codecId: string;
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
	codecId: string;
	type: 'video';
	codecPrivate: Uint8Array | null;
};

export const makeMatroskaAudioTrackEntryBytes = ({
	trackNumber,
	codecId,
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
				value: codecId,
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
	codecId,
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
				value: codecId,
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
