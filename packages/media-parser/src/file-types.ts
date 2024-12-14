import {webmPattern} from './boxes/webm/make-header';

const matchesPattern = (pattern: Uint8Array) => {
	return (data: Uint8Array) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

const isRiff = (data: Uint8Array) => {
	const riffPattern = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
	return matchesPattern(riffPattern)(data.subarray(0, 4));
};

const isWebm = (data: Uint8Array) => {
	return matchesPattern(webmPattern)(data.subarray(0, 4));
};

const isIsoBaseMedia = (data: Uint8Array) => {
	const isoBaseMediaMp4Pattern = new TextEncoder().encode('ftyp');

	return matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8));
};

const isTransportStream = (data: Uint8Array) => {
	return data[0] === 0x47 && data[188] === 0x47;
};

const isMp3 = (data: Uint8Array) => {
	const mpegPattern = new Uint8Array([0xff, 0xf3, 0xe4, 0x64]);

	return matchesPattern(mpegPattern)(data.subarray(0, 4));
};

const isGif = (data: Uint8Array) => {
	const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);

	return matchesPattern(gifPattern)(data.subarray(0, 4));
};

const isPng = (data: Uint8Array) => {
	const pngPattern = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

	return matchesPattern(pngPattern)(data.subarray(0, 4));
};

const isBmp = (data: Uint8Array) => {
	const bmpPattern = new Uint8Array([0x42, 0x4d]);

	return matchesPattern(bmpPattern)(data.subarray(0, 2));
};

const isJpeg = (data: Uint8Array) => {
	const jpegPattern = new Uint8Array([0xff, 0xd8]);

	return matchesPattern(jpegPattern)(data.subarray(0, 2));
};

export const detectFileType = (data: Uint8Array) => {
	if (isRiff(data)) {
		return 'riff';
	}

	if (isWebm(data)) {
		return 'webm';
	}

	if (isIsoBaseMedia(data)) {
		return 'iso-base-media';
	}

	if (isTransportStream(data)) {
		return 'transport-stream';
	}

	if (isMp3(data)) {
		return 'mp3';
	}

	if (isGif(data)) {
		return 'gif';
	}

	if (isPng(data)) {
		return 'png';
	}

	if (isBmp(data)) {
		return 'bmp';
	}

	if (isJpeg(data)) {
		return 'jpeg';
	}

	return 'unknown';
};
