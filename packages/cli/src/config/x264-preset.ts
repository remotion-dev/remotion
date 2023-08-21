import type {X264Preset} from '@remotion/renderer';

let preset: X264Preset | undefined;

export const getX264Preset = (): X264Preset | undefined => {
	return preset;
};

export const setX264Preset = (profile: X264Preset | undefined) => {
	preset = profile;
};
