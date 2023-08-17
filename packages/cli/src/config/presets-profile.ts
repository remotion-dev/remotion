import type {PresetsProfile} from '@remotion/renderer';

let preset: PresetsProfile | undefined;

export const getPresetProfile = (): PresetsProfile | undefined => {
	return preset;
};

export const setPresetProfile = (profile: PresetsProfile | undefined) => {
	preset = profile;
};
