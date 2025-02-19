import type {Codec} from './codec';
import {getValidCrfRanges} from './crf';

type MediaSupport = {
	video: boolean;
	audio: boolean;
};

const support: {[key in Codec]: MediaSupport} = {
	'h264-mkv': {
		audio: true,
		video: true,
	},
	aac: {
		audio: true,
		video: false,
	},
	gif: {
		video: true,
		audio: false,
	},
	h264: {
		video: true,
		audio: true,
	},
	'h264-ts': {
		video: true,
		audio: true,
	},
	h265: {
		video: true,
		audio: true,
	},
	mp3: {
		audio: true,
		video: false,
	},
	prores: {
		audio: true,
		video: true,
	},
	vp8: {
		audio: true,
		video: true,
	},
	vp9: {
		audio: true,
		video: true,
	},
	wav: {
		audio: true,
		video: false,
	},
};

export const codecSupportsMedia = (codec: Codec): MediaSupport => {
	return support[codec];
};

const codecSupportsVideoBitrateMap: {[key in Codec]: boolean} = {
	'h264-mkv': true,
	'h264-ts': true,
	aac: false,
	gif: false,
	h264: true,
	h265: true,
	mp3: false,
	prores: false,
	vp8: true,
	vp9: true,
	wav: false,
};

export const codecSupportsCrf = (codec: Codec) => {
	const range = getValidCrfRanges(codec);
	return range[0] !== range[1];
};

export const codecSupportsVideoBitrate = (codec: Codec) => {
	return codecSupportsVideoBitrateMap[codec];
};
