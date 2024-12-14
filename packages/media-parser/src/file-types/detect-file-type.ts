import {webmPattern} from '../boxes/webm/make-header';
import type {BmpType} from './bmp';
import type {JpegType} from './jpeg';

export const matchesPattern = (pattern: Uint8Array) => {
	return (data: Uint8Array) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

export const isRiff = (data: Uint8Array) => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	return matchesPattern(riffPattern)(data.subarray(0, 4));
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

	return matchesPattern(mpegPattern)(data.subarray(0, 4));
};

export const isGif = (data: Uint8Array) => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	return matchesPattern(gifPattern)(data.subarray(0, 4));
};

export const isPng = (data: Uint8Array) => {
	const pngPattern = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	return matchesPattern(pngPattern)(data.subarray(0, 4));
};

export const isWebp = (data: Uint8Array) => {
	const webpPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);

	return matchesPattern(webpPattern)(data.subarray(0, 4));
};

export type WebpType = {
	type: 'webp';
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

export type PngType = {
	type: 'png';
};

export type UnknownType = {
	type: 'unknown';
};

export type FileType =
	| JpegType
	| WebpType
	| RiffType
	| WebmType
	| IsoBaseMediaType
	| TransportStreamType
	| Mp3Type
	| GifType
	| PngType
	| BmpType
	| UnknownType;
