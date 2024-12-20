import {getKeyframesFromIsoBaseMedia} from '../get-keyframes';
import {isoBaseMediaHasTracks} from '../get-tracks';
import type {MediaParserKeyframe} from '../options';
import type {Structure} from '../parse-result';

export const keyframesState = (getStructure: () => Structure) => {
	let hasKeyframes = false;
	const keyframes: MediaParserKeyframe[] = [];

	return {
		getHasKeyframes: () => {
			const structure = getStructure();
			if (structure.type === 'iso-base-media') {
				isoBaseMediaHasTracks(structure);
			}

			return hasKeyframes;
		},
		setHasKeyframes: (value: boolean) => {
			hasKeyframes = value;
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
