export type FileDimensions = {
	readonly width: number;
	readonly height: number;
};

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
	const mpegPattern = new Uint8Array([0xff, 0xf3]);
	const mpegPattern2 = new Uint8Array([0xff, 0xfb]);
	const id3v4Pattern = new Uint8Array([0x49, 0x44, 0x33, 4]);
	const id3v3Pattern = new Uint8Array([0x49, 0x44, 0x33, 3]);
	const id3v2Pattern = new Uint8Array([0x49, 0x44, 0x33, 2]);

	const subarray = data.subarray(0, 4);
	return (
		matchesPattern(mpegPattern)(subarray) ||
		matchesPattern(mpegPattern2)(subarray) ||
		matchesPattern(id3v4Pattern)(subarray) ||
		matchesPattern(id3v3Pattern)(subarray) ||
		matchesPattern(id3v2Pattern)(subarray)
	);
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

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
const acTLChunkType = new Uint8Array([0x61, 0x63, 0x54, 0x4c]);
const idatChunkType = new Uint8Array([0x49, 0x44, 0x41, 0x54]);
const iendChunkType = new Uint8Array([0x49, 0x45, 0x4e, 0x44]);

const getPngDimensions = (pngData: Uint8Array): FileDimensions | null => {
	if (pngData.length < 24) {
		return null;
	}

	const view = new DataView(pngData.buffer, pngData.byteOffset);
	for (let i = 0; i < 8; i++) {
		if (pngData[i] !== pngSignature[i]) {
			return null;
		}
	}

	return {
		width: view.getUint32(16, false),
		height: view.getUint32(20, false),
	};
};

const hasApngAnimationControlChunk = (pngData: Uint8Array): boolean => {
	if (pngData.length < 16) {
		return false;
	}

	const view = new DataView(
		pngData.buffer,
		pngData.byteOffset,
		pngData.byteLength,
	);
	let offset = 8;

	while (offset + 8 <= pngData.length) {
		const chunkLength = view.getUint32(offset, false);
		const chunkType = pngData.subarray(offset + 4, offset + 8);
		if (matchesPattern(acTLChunkType)(chunkType)) {
			return true;
		}

		if (
			matchesPattern(idatChunkType)(chunkType) ||
			matchesPattern(iendChunkType)(chunkType)
		) {
			return false;
		}

		const nextOffset = offset + 12 + chunkLength;
		if (nextOffset <= offset) {
			return false;
		}

		offset = nextOffset;
	}

	return false;
};

const isPng = (data: Uint8Array): PngType | ApngType | null => {
	const pngPattern = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	if (matchesPattern(pngPattern)(data.subarray(0, 4))) {
		const png = getPngDimensions(data);
		return {
			dimensions: png,
			type: hasApngAnimationControlChunk(data) ? 'apng' : 'png',
		};
	}

	return null;
};

const getJpegDimensions = (data: Uint8Array): FileDimensions | null => {
	let offset = 0;

	const readUint16BE = (o: number): number => {
		return (data[o] << 8) | data[o + 1];
	};

	if (data.length < 4 || readUint16BE(offset) !== 0xffd8) {
		return null;
	}

	offset += 2;

	while (offset + 3 < data.length) {
		if (data[offset] === 0xff) {
			const marker = data[offset + 1];
			if (marker === 0xc0 || marker === 0xc2) {
				if (offset + 8 >= data.length) {
					return null;
				}

				const height = readUint16BE(offset + 5);
				const width = readUint16BE(offset + 7);
				return {width, height};
			}

			const length = readUint16BE(offset + 2);
			if (length <= 0) {
				return null;
			}

			offset += length + 2;
		} else {
			offset++;
		}
	}

	return null;
};

const isJpeg = (data: Uint8Array): JpegType | null => {
	const jpegPattern = new Uint8Array([0xff, 0xd8]);

	const jpeg = matchesPattern(jpegPattern)(data.subarray(0, 2));
	if (!jpeg) {
		return null;
	}

	const dim = getJpegDimensions(data);
	return {dimensions: dim, type: 'jpeg'};
};

const getGifDimensions = (data: Uint8Array): FileDimensions | null => {
	if (data.length < 10) {
		return null;
	}

	const view = new DataView(data.buffer, data.byteOffset);

	const width = view.getUint16(6, true);
	const height = view.getUint16(8, true);

	return {width, height};
};

const isGif = (data: Uint8Array): GifType | null => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	if (matchesPattern(gifPattern)(data.subarray(0, 4))) {
		return {type: 'gif', dimensions: getGifDimensions(data)};
	}

	return null;
};

const getWebPDimensions = (bytes: Uint8Array): FileDimensions | null => {
	if (bytes.length < 30) {
		return null;
	}

	if (
		bytes[0] !== 0x52 ||
		bytes[1] !== 0x49 ||
		bytes[2] !== 0x46 ||
		bytes[3] !== 0x46 ||
		bytes[8] !== 0x57 ||
		bytes[9] !== 0x45 ||
		bytes[10] !== 0x42 ||
		bytes[11] !== 0x50
	) {
		return null;
	}

	if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38) {
		if (bytes[15] === 0x20) {
			return {
				width: bytes[26] | ((bytes[27] << 8) & 0x3fff),
				height: bytes[28] | ((bytes[29] << 8) & 0x3fff),
			};
		}
	}

	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x4c
	) {
		return {
			width: 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8)),
			height:
				1 +
				(((bytes[22] & 0xc0) >> 6) |
					(bytes[23] << 2) |
					((bytes[24] & 0x0f) << 10)),
		};
	}

	if (
		bytes[12] === 0x56 &&
		bytes[13] === 0x50 &&
		bytes[14] === 0x38 &&
		bytes[15] === 0x58
	) {
		return {
			width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)),
			height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)),
		};
	}

	return null;
};

const isAnimatedWebp = (data: Uint8Array): boolean => {
	const animationChunk = new Uint8Array([0x41, 0x4e, 0x49, 0x4d]);
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	let offset = 12;

	while (offset + 8 <= data.length) {
		const chunkType = data.subarray(offset, offset + 4);
		if (matchesPattern(animationChunk)(chunkType)) {
			return true;
		}

		const chunkLength = view.getUint32(offset + 4, true);
		const nextOffset = offset + 8 + chunkLength + (chunkLength % 2);
		if (nextOffset <= offset) {
			return false;
		}

		offset = nextOffset;
	}

	return false;
};

const isWebp = (data: Uint8Array): WebpType | null => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	const webpPattern = new Uint8Array([0x57, 0x45, 0x42, 0x50]);

	if (
		matchesPattern(riffPattern)(data.subarray(0, 4)) &&
		matchesPattern(webpPattern)(data.subarray(8, 12))
	) {
		return {
			type: 'webp',
			dimensions: getWebPDimensions(data),
			animated: isAnimatedWebp(data),
		};
	}

	return null;
};

const getBmpDimensions = (bmpData: Uint8Array): FileDimensions | null => {
	if (bmpData.length < 26) {
		return null;
	}

	const view = new DataView(bmpData.buffer, bmpData.byteOffset);

	return {
		width: view.getUint32(18, true),
		height: Math.abs(view.getInt32(22, true)),
	};
};

const isBmp = (data: Uint8Array): BmpType | null => {
	const bmpPattern = new Uint8Array([0x42, 0x4d]);

	if (matchesPattern(bmpPattern)(data.subarray(0, 2))) {
		const bmp = getBmpDimensions(data);
		return {dimensions: bmp, type: 'bmp'};
	}

	return null;
};

const isPdf = (data: Uint8Array): PdfType | null => {
	if (data.length < 4) {
		return null;
	}

	const pdfPattern = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

	return matchesPattern(pdfPattern)(data.subarray(0, 4)) ? {type: 'pdf'} : null;
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
	dimensions: FileDimensions | null;
};

export type FlacType = {
	type: 'flac';
};

export type M3uType = {
	type: 'm3u';
};

export type PngType = {
	type: 'png';
	dimensions: FileDimensions | null;
};

export type ApngType = {
	type: 'apng';
	dimensions: FileDimensions | null;
};

export type JpegType = {
	type: 'jpeg';
	dimensions: FileDimensions | null;
};

export type WebpType = {
	type: 'webp';
	dimensions: FileDimensions | null;
	animated: boolean;
};

export type BmpType = {
	type: 'bmp';
	dimensions: FileDimensions | null;
};

export type PdfType = {
	type: 'pdf';
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
	| ApngType
	| BmpType
	| AacType
	| FlacType
	| M3uType
	| UnknownType;

export type ImageFileType =
	| JpegType
	| WebpType
	| GifType
	| PngType
	| ApngType
	| BmpType;

export const isImageFileType = (
	fileType: FileType,
): fileType is ImageFileType => {
	return (
		fileType.type === 'jpeg' ||
		fileType.type === 'webp' ||
		fileType.type === 'gif' ||
		fileType.type === 'png' ||
		fileType.type === 'apng' ||
		fileType.type === 'bmp'
	);
};

export const detectFileType = (data: Uint8Array): FileType => {
	if (isRiffWave(data)) {
		return {type: 'wav'};
	}

	if (isRiffAvi(data)) {
		return {type: 'riff'};
	}

	if (isAac(data)) {
		return {type: 'aac'};
	}

	if (isFlac(data)) {
		return {type: 'flac'};
	}

	if (isM3u(data)) {
		return {type: 'm3u'};
	}

	const webp = isWebp(data);
	if (webp) {
		return webp;
	}

	if (isWebm(data)) {
		return {type: 'webm'};
	}

	if (isIsoBaseMedia(data)) {
		return {type: 'iso-base-media'};
	}

	if (isTransportStream(data)) {
		return {type: 'transport-stream'};
	}

	if (isMp3(data)) {
		return {type: 'mp3'};
	}

	const gif = isGif(data);
	if (gif) {
		return gif;
	}

	const png = isPng(data);
	if (png) {
		return png;
	}

	const pdf = isPdf(data);
	if (pdf) {
		return pdf;
	}

	const bmp = isBmp(data);
	if (bmp) {
		return bmp;
	}

	const jpeg = isJpeg(data);
	if (jpeg) {
		return jpeg;
	}

	return {type: 'unknown'};
};
