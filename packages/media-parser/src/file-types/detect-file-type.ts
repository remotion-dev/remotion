import {webmPattern} from '../boxes/webm/make-header';
import type {BmpType} from './bmp';
import type {JpegType} from './jpeg';
import type {PdfType} from './pdf';
import type {PngType} from './png';
import type {WebpType} from './webp';

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
	return new TextDecoder().decode(fileType) === 'AVI ';
};

export const isRiffWave = (data: Uint8Array) => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	if (!matchesPattern(riffPattern)(data.subarray(0, 4))) {
		return false;
	}

	const fileType = data.subarray(8, 12);
	return new TextDecoder().decode(fileType) === 'WAVE';
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
	const id3Pattern = new Uint8Array([73, 68, 51, 3]);

	const subarray = data.subarray(0, 4);
	return (
		matchesPattern(mpegPattern)(subarray) ||
		matchesPattern(id3Pattern)(subarray)
	);
};

export const isGif = (data: Uint8Array) => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	return matchesPattern(gifPattern)(data.subarray(0, 4));
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

export type GifType = {
	type: 'gif';
};

export type UnknownType = {
	type: 'unknown';
};

export type FileType =
	| JpegType
	| WebpType
	| RiffType
	| WebmType
	| PdfType
	| IsoBaseMediaType
	| TransportStreamType
	| Mp3Type
	| GifType
	| PngType
	| BmpType
	| UnknownType;
