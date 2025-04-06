import type {MediaParserKeyframe} from '../options';
import type {WebmSeekingHints} from '../seeking-hints';

export const keyframesState = () => {
	const keyframes: MediaParserKeyframe[] = [];

	const addKeyframe = (keyframe: MediaParserKeyframe) => {
		if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
			return;
		}

		keyframes.push(keyframe);
	};

	const getKeyframes = (): MediaParserKeyframe[] => {
		return keyframes;
	};

	const setFromSeekingHints = (hints: WebmSeekingHints) => {
		for (const keyframe of hints.keyframes) {
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
