import {Codec, ProResProfile} from 'remotion';

const proResProfiles = ['4444-xq', '4444', 'hq', 'standard', 'light', 'proxy'];

export const getProResProfileName = (
	codec: Codec,
	proResProfile: ProResProfile | undefined
): string | null => {
	if (codec !== 'prores') {
		return null;
	}

	if (proResProfiles.indexOf(proResProfile) === -1) {
		return '3';
	}

	return proResProfile;
};
