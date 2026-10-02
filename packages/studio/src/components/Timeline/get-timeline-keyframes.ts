import {CanvasInternals} from '@remotion/sdk';

export type {KeyframeSourceFrame} from '@remotion/sdk';

export const {
	getKeyframeDisplayOffset,
	getKeyframeLocalFrame,
	getKeyframePlaybackRate,
	getKeyframeSourceFrame,
	getTimelineKeyframes,
	resolveKeyframeSourceFrame,
} = CanvasInternals;
