import type {AvcProfileInfo} from './parse-avc';

export const getCodecStringFromSpsAndPps = (sps: AvcProfileInfo) => {
	return `avc1.${sps.spsData.profile.toString(16).padStart(2, '0')}${sps.spsData.compatibility.toString(16).padStart(2, '0')}${sps.spsData.level.toString(16).padStart(2, '0')}`;
};
