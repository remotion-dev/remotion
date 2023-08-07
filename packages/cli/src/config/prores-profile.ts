import type {ProResProfile} from '@remotion/renderer';

let proResProfile: ProResProfile | undefined;

export const getProResProfile = (): ProResProfile | undefined => {
	return proResProfile;
};

export const setProResProfile = (profile: ProResProfile | undefined) => {
	proResProfile = profile;
};
