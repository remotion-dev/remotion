import {isBmp} from './bmp';
import type {FileType} from './detect-file-type';
import {
	isGif,
	isIsoBaseMedia,
	isMp3,
	isRiffAvi,
	isRiffWave,
	isTransportStream,
	isWebm,
} from './detect-file-type';
import {isJpeg} from './jpeg';
import {isPng} from './png';
import {isWebp} from './webp';

export const detectFileType = (data: Uint8Array): FileType => {
	if (isRiffAvi(data) || isRiffWave(data)) {
		return {type: 'riff'};
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

	if (isGif(data)) {
		return {type: 'gif'};
	}

	const png = isPng(data);
	if (png) {
		return png;
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
