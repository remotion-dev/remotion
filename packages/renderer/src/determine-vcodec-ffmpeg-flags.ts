import type {SpecialVCodecForTransparency} from './assets/download-map';
import {truthy} from './truthy';

export const determineVcodecFfmpegFlags = (
	vcodecFlag: SpecialVCodecForTransparency
) => {
	return [
		vcodecFlag === 'vp9' ? '-vcodec' : null,
		vcodecFlag === 'vp9' ? 'libvpx-vp9' : null,
		vcodecFlag === 'vp8' ? '-vcodec' : null,
		vcodecFlag === 'vp8' ? 'libvpx' : null,
	].filter(truthy);
};
