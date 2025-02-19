import type {BmpType} from './bmp';
import type {JpegType} from './jpeg';
import type {PdfType} from './pdf';
import type {PngType} from './png';
import type {WebpType} from './webp';

const webmPattern = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);

export const matchesPattern = (pattern: Uint8Array) => {
	return (data: Uint8Array) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

export const isRiffAvi = (data: Uint8Array) => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	if (!matchesPattern(riffPattern)(data.subarray(0, 4))) {
		return false;
	}

	const fileType = data.subarray(8, 12);
	const aviPattern = new Uint8Array([0x41, 0x56, 0x49, 0x20]);
	return matchesPattern(aviPattern)(fileType);
};

export const isRiffWave = (data: Uint8Array) => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	if (!matchesPattern(riffPattern)(data.subarray(0, 4))) {
		return false;
	}

	const fileType = data.subarray(8, 12);
	const wavePattern = new Uint8Array([0x57, 0x41, 0x56, 0x45]);
	return matchesPattern(wavePattern)(fileType);
};

export const isWebm = (data: Uint8Array) => {
	return matchesPattern(webmPattern)(data.subarray(0, 4));
};

export const isIsoBaseMedia = (data: Uint8Array) => {
	const isoBaseMediaMp4Pattern = new TextEncoder().encode('ftyp');

	return matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8));
};

export const isTransportStream = (data: Uint8Array) => {
	return data[0] === 0x47 && data[188] === 0x47;
};

export const isMp3 = (data: Uint8Array) => {
	const mpegPattern = new Uint8Array([0xff, 0xf3, 0xe4, 0x64]);
	const id3v4Pattern = new Uint8Array([0x49, 0x44, 0x33, 4]);
	const id3v3Pattern = new Uint8Array([0x49, 0x44, 0x33, 3]);
	const id3v2Pattern = new Uint8Array([0x49, 0x44, 0x33, 2]);

	const subarray = data.subarray(0, 4);
	return (
		matchesPattern(mpegPattern)(subarray) ||
		matchesPattern(id3v4Pattern)(subarray) ||
		matchesPattern(id3v3Pattern)(subarray) ||
		matchesPattern(id3v2Pattern)(subarray)
	);
};

export const isGif = (data: Uint8Array) => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	return matchesPattern(gifPattern)(data.subarray(0, 4));
};

export const isAac = (data: Uint8Array) => {
	const aacPattern = new Uint8Array([0xff, 0xf1]);

	return matchesPattern(aacPattern)(data.subarray(0, 2));
};

export const isFlac = (data: Uint8Array) => {
	const flacPattern = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);

	return matchesPattern(flacPattern)(data.subarray(0, 4));
};

export const isM3u = (data: Uint8Array) => {
	return new TextDecoder('utf-8').decode(data.slice(0, 7)) === '#EXTM3U';
};

export type RiffType = {
	type: 'riff';
};

export type WebmType = {
	type: 'webm';
};

export type IsoBaseMediaType = {
	type: 'iso-base-media';
};

export type TransportStreamType = {
	type: 'transport-stream';
};

export type Mp3Type = {
	type: 'mp3';
};

export type AacType = {
	type: 'aac';
};

export type WavType = {
	type: 'wav';
};

export type GifType = {
	type: 'gif';
};

export type FlacType = {
	type: 'flac';
};

export type M3uType = {
	type: 'm3u';
};

export type UnknownType = {
	type: 'unknown';
};

export type FileType =
	| JpegType
	| WebpType
	| RiffType
	| WebmType
	| WavType
	| PdfType
	| AacType
	| IsoBaseMediaType
	| TransportStreamType
	| Mp3Type
	| GifType
	| PngType
	| BmpType
	| AacType
	| FlacType
	| M3uType
	| UnknownType;
