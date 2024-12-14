import {isBmp} from './bmp';
import type {FileType} from './detect-file-type';
import {
	isGif,
	isIsoBaseMedia,
	isMp3,
	isPng,
	isRiff,
	isTransportStream,
	isWebm,
	isWebp,
} from './detect-file-type';
import {isJpeg} from './jpeg';

export const detectFileType = (data: Uint8Array): FileType => {
	if (isWebp(data)) {
		return {type: 'webp'};
	}

	if (isRiff(data)) {
		return {type: 'riff'};
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

	if (isGif(data)) {
		return {type: 'gif'};
	}

	if (isPng(data)) {
		return {type: 'png'};
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
