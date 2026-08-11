import type {MediaParserKeyframe} from './options';

export function findLastKeyframe<T extends MediaParserKeyframe>({
	keyframes,
	timeInSeconds,
}: {
	keyframes: T[];
	timeInSeconds: number;
}): T | null {
	let bestKeyframe: T | null = null;

	for (const keyframe of keyframes) {
		if (
			keyframe.presentationTimeInSeconds > timeInSeconds &&
			keyframe.decodingTimeInSeconds > timeInSeconds
		) {
			break;
		}

		if (
			bestKeyframe === null ||
			keyframe.presentationTimeInSeconds >
				bestKeyframe.presentationTimeInSeconds
		) {
			bestKeyframe = keyframe;
		}
	}

	return bestKeyframe;
}
