import type {_InternalTypes} from 'remotion';

let proResProfile: _InternalTypes['ProResProfile'] | undefined;

export const getProResProfile = ():
	| _InternalTypes['ProResProfile']
	| undefined => {
	return proResProfile;
};

export const setProResProfile = (
	profile: _InternalTypes['ProResProfile'] | undefined,
) => {
	proResProfile = profile;
};
