import {getKeyframesFromIsoBaseMedia} from '../get-keyframes';
import {isoBaseMediaHasTracks} from '../get-tracks';
import type {MediaParserKeyframe} from '../options';
import type {Structure} from '../parse-result';

export const keyframesState = () => {
	let hasKeyframes = false;
	const keyframes: MediaParserKeyframe[] = [];

	return {
		getHasKeyframes: (structure: Structure) => {
			if (structure.type === 'iso-base-media') {
				isoBaseMediaHasTracks(structure);
			}

			return hasKeyframes;
		},
		setHasKeyframes: (value: boolean) => {
			hasKeyframes = value;
		},
		getKeyframes: (structure: Structure): MediaParserKeyframe[] => {
			if (structure.type === 'iso-base-media') {
				return getKeyframesFromIsoBaseMedia(structure);
			}

			return keyframes;
		},
	};
};
