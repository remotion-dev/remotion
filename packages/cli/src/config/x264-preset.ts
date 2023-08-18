import type {x264Preset} from '@remotion/renderer';

let preset: x264Preset | undefined;

export const getX264Preset = (): x264Preset | undefined => {
	return preset;
};

export const setX264Preset = (profile: x264Preset | undefined) => {
	preset = profile;
};
