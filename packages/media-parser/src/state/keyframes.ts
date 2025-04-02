import type {MediaParserKeyframe} from '../options';

export const keyframesState = () => {
	const keyframes: MediaParserKeyframe[] = [];

	return {
		addKeyframe: (keyframe: MediaParserKeyframe) => {
			if (
				keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)
			) {
				return;
			}

			keyframes.push(keyframe);
		},
		getKeyframes: (): MediaParserKeyframe[] => {
			return keyframes;
		},
	};
};

export type KeyframesState = ReturnType<typeof keyframesState>;
