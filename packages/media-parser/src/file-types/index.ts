import {isBmp} from './bmp';
import type {FileType} from './detect-file-type';
import {
	isAac,
	isFlac,
	isGif,
	isIsoBaseMedia,
	isM3u,
	isMp3,
	isRiffAvi,
	isRiffWave,
	isTransportStream,
	isWebm,
} from './detect-file-type';
import {isJpeg} from './jpeg';
import {isPdf} from './pdf';
import {isPng} from './png';
import {isWebp} from './webp';

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

	if (isGif(data)) {
		return {type: 'gif'};
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
