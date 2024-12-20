import type {MediaParserKeyframe} from '../options';

export const keyframesState = () => {
	let hasKeyframes = false;
	const keyframes: MediaParserKeyframe[] = [];

	return {
		getHasKeyframes: () => hasKeyframes,
		setHasKeyframes: (value: boolean) => {
			hasKeyframes = value;
		},
		getKeyframes: () => keyframes,
	};
};
