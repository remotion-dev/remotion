import type {MediaParserKeyframe} from '../options';

export const keyframesState = () => {
	const keyframes: MediaParserKeyframe[] = [];

	const addKeyframe = (keyframe: MediaParserKeyframe) => {
		if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
			return;
		}

		keyframes.push(keyframe);
	};

	const getKeyframes = (): MediaParserKeyframe[] => {
		keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
		return keyframes;
	};

	const setFromSeekingHints = (keyframesFromHints: MediaParserKeyframe[]) => {
		for (const keyframe of keyframesFromHints) {
			addKeyframe(keyframe);
		}
	};

	return {
		addKeyframe,
		getKeyframes,
		setFromSeekingHints,
	};
};

export type KeyframesState = ReturnType<typeof keyframesState>;
