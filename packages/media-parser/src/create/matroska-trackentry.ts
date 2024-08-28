import {makeMatroskaBytes} from '../boxes/webm/make-header';
import type {BytesAndOffset} from '../boxes/webm/segments/all-segments';

export type MatroskaColorParams = {
	transferChracteristics: 'bt709' | 'smpte170m' | 'iec61966-2-1' | null;
	matrixCoefficients: 'bt709' | 'bt470bg' | 'rgb' | 'smpte170m' | null;
	primaries: 'bt709' | 'smpte170m' | 'bt470bg' | null;
	fullRange: boolean | null;
};

export const makeMatroskaColorBytes = ({
	transferChracteristics,
	matrixCoefficients,
	primaries,
	fullRange,
}: MatroskaColorParams) => {
	const rangeValue =
		transferChracteristics && matrixCoefficients
			? 3
			: fullRange === true
				? 2
				: fullRange === false
					? 1
					: 0;

	// https://datatracker.ietf.org/doc/draft-ietf-cellar-matroska/
	// 5.1.4.1.28.27
	const primariesValue =
		primaries === 'bt709'
			? 1
			: primaries === 'smpte170m'
				? 6
				: primaries === 'bt470bg'
					? 5
					: 2;

	const transferChracteristicsValue =
		transferChracteristics === 'bt709'
			? 1
			: transferChracteristics === 'smpte170m'
				? 6
				: transferChracteristics === 'iec61966-2-1'
					? 13
					: 2;

	if (matrixCoefficients === 'rgb') {
		throw new Error('Cannot encode Matroska in RGB');
	}

	const matrixCoefficientsValue =
		matrixCoefficients === 'bt709'
			? 1
			: matrixCoefficients === 'bt470bg'
				? 5
				: matrixCoefficients === 'smpte170m'
					? 6
					: 2;

	return makeMatroskaBytes({
		type: 'Colour',
		minVintWidth: null,
		value: [
			{
				type: 'TransferCharacteristics',
				value: {
					value: transferChracteristicsValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'MatrixCoefficients',
				value: {
					value: matrixCoefficientsValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'Primaries',
				value: {
					value: primariesValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
			{
				type: 'Range',
				value: {
					value: rangeValue,
					byteLength: null,
				},
				minVintWidth: null,
			},
		],
	});
};

export const makeMatroskaVideoBytes = ({
	color,
	width,
	height,
}: {
	color: MatroskaColorParams;
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

export const makeMatroskaAudioTrackEntryBytes = ({
	trackNumber,
	codecId,
}: {
	trackNumber: number;
	codecId: string;
}) => {
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
							value: 2,
							byteLength: null,
						},
					},
					{
						type: 'SamplingFrequency',
						minVintWidth: null,
						value: {
							value: 44100,
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
		],
	});
};

export const makeMatroskaVideoTrackEntryBytes = ({
	color,
	width,
	height,
	defaultDuration,
	trackNumber,
	codecId,
}: {
	color: MatroskaColorParams;
	width: number;
	height: number;
	defaultDuration: number;
	trackNumber: number;
	codecId: string;
}) => {
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
			{
				type: 'DefaultDuration',
				value: {
					value: defaultDuration,
					byteLength: null,
				},
				minVintWidth: null,
			},
			makeMatroskaVideoBytes({
				color,
				width,
				height,
			}),
		],
	});
};

export const makeMatroskaTracks = (tracks: BytesAndOffset[]) => {
	return makeMatroskaBytes({
		type: 'Tracks',
		value: tracks,
		minVintWidth: null,
	});
};
