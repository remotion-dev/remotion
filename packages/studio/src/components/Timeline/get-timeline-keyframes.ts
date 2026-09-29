import {CanvasInternals} from '@remotion/canvas';

export type {KeyframeSourceFrame} from '@remotion/canvas';

export const {
	getKeyframeDisplayOffset,
	getKeyframeLocalFrame,
	getKeyframePlaybackRate,
	getKeyframeSourceFrame,
	getTimelineKeyframes,
	resolveKeyframeSourceFrame,
} = CanvasInternals;
