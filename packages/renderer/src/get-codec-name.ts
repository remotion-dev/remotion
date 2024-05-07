import type {Codec} from './codec';

const map: {[key in Codec]: string | null} = {
	h264: 'libx264',
	h265: 'libx265',
	vp8: 'libvpx',
	vp9: 'libvpx-vp9',
	prores: 'prores_ks',
	gif: 'gif',
	mp3: null,
	aac: null,
	wav: null,
	'h264-mkv': 'libx264',
	'h264-ts': 'libx264',
	avi: 'rawvideo',
};

export const getCodecName = (codec: Codec): string | null => {
	return map[codec];
};
