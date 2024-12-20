import {getKeyframesFromIsoBaseMedia} from '../boxes/iso-base-media/get-keyframes';
import {isoBaseMediaHasTracks} from '../get-tracks';
import type {MediaParserKeyframe} from '../options';
import type {Structure} from '../parse-result';

export const keyframesState = (getStructure: () => Structure) => {
	const keyframes: MediaParserKeyframe[] = [];

	return {
		getHasKeyframes: () => {
			const structure = getStructure();
			if (structure.type === 'iso-base-media') {
				return isoBaseMediaHasTracks(structure);
			}

			return false;
		},
		addKeyframe: (keyframe: MediaParserKeyframe) => {
			keyframes.push(keyframe);
		},
		getKeyframes: (): MediaParserKeyframe[] => {
			const structure = getStructure();
			if (structure.type === 'iso-base-media') {
				return getKeyframesFromIsoBaseMedia(structure);
			}

			return keyframes;
		},
	};
};

export type KeyframesState = ReturnType<typeof keyframesState>;
