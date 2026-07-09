import type {CanUpdateSequencePropStatusEasing} from 'remotion';

export type KeyframeEasing = CanUpdateSequencePropStatusEasing;

export type KeyframeEasingPreset = {
	readonly id:
		| 'ease-in'
		| 'ease-out'
		| 'ease-in-out'
		| 'spring'
		| 'bouncy-spring'
		| 'tail-spring';
	readonly label: string;
	readonly easing: KeyframeEasing;
};

export const LINEAR_KEYFRAME_EASING: KeyframeEasing = {type: 'linear'};

export const EASE_KEYFRAME_EASING: KeyframeEasing = {
	type: 'bezier',
	x1: 0.42,
	y1: 0,
	x2: 1,
	y2: 1,
};

export const QUAD_KEYFRAME_EASING: KeyframeEasing = {
	type: 'bezier',
	x1: 1 / 3,
	y1: 0,
	x2: 2 / 3,
	y2: 1 / 3,
};

export const CUBIC_KEYFRAME_EASING: KeyframeEasing = {
	type: 'bezier',
	x1: 1 / 3,
	y1: 0,
	x2: 2 / 3,
	y2: 0,
};

export const getBackKeyframeEasing = (s = 1.70158): KeyframeEasing => ({
	type: 'bezier',
	x1: 1 / 3,
	y1: 0,
	x2: 2 / 3,
	y2: -s / 3,
});

export const getPolyKeyframeEasing = (n: number): KeyframeEasing | null => {
	if (n === 1) {
		return LINEAR_KEYFRAME_EASING;
	}

	if (n === 2) {
		return QUAD_KEYFRAME_EASING;
	}

	if (n === 3) {
		return CUBIC_KEYFRAME_EASING;
	}

	return null;
};

export const getOutKeyframeEasing = (
	easing: KeyframeEasing,
): KeyframeEasing | null => {
	if (easing.type === 'linear') {
		return LINEAR_KEYFRAME_EASING;
	}

	if (easing.type !== 'bezier') {
		return null;
	}

	return {
		type: 'bezier',
		x1: 1 - easing.x2,
		y1: 1 - easing.y2,
		x2: 1 - easing.x1,
		y2: 1 - easing.y1,
	};
};

export const KEYFRAME_EASING_PRESETS: KeyframeEasingPreset[] = [
	{
		id: 'ease-in',
		label: 'Ease in',
		easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
	},
	{
		id: 'ease-out',
		label: 'Ease out',
		easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
	},
	{
		id: 'ease-in-out',
		label: 'Ease in-out',
		easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1},
	},
	{
		id: 'tail-spring',
		label: 'Tail spring',
		easing: {
			type: 'spring',
			allowTail: true,
			damping: 200,
			durationRestThreshold: 0.02,
			mass: 1,
			overshootClamping: false,
			stiffness: 100,
		},
	},
	{
		id: 'spring',
		label: 'Spring',
		easing: {
			type: 'spring',
			allowTail: true,
			damping: 10,
			durationRestThreshold: 0.02,
			mass: 1,
			overshootClamping: false,
			stiffness: 100,
		},
	},
	{
		id: 'bouncy-spring',
		label: 'Bouncy spring',
		easing: {
			type: 'spring',
			allowTail: true,
			damping: 5,
			durationRestThreshold: 0.02,
			mass: 1,
			overshootClamping: false,
			stiffness: 120,
		},
	},
];
