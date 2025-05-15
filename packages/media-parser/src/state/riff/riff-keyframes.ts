import type {MediaParserKeyframe} from '../../options';

export type RiffKeyframe = MediaParserKeyframe & {
	sampleCounts: Record<number, number>;
};

export const riffKeyframesState = () => {
	const keyframes: RiffKeyframe[] = [];

	const addKeyframe = (keyframe: RiffKeyframe) => {
		if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
			return;
		}

		keyframes.push(keyframe);
		keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
	};

	const getKeyframes = (): RiffKeyframe[] => {
		return keyframes;
	};

	const setFromSeekingHints = (keyframesFromHints: RiffKeyframe[]) => {
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

export type RiffKeyframesState = ReturnType<typeof riffKeyframesState>;
