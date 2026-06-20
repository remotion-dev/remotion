import type {CanUpdateSequencePropStatusEasing} from 'remotion';

export type KeyframeEasing = CanUpdateSequencePropStatusEasing;

export type KeyframeEasingPreset = {
	readonly id:
		| 'ease-in'
		| 'ease-out'
		| 'ease-in-out'
		| 'spring'
		| 'bouncy-spring';
	readonly label: string;
	readonly easing: KeyframeEasing;
};

export const LINEAR_KEYFRAME_EASING: KeyframeEasing = {type: 'linear'};

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
		id: 'spring',
		label: 'Spring',
		easing: {
			type: 'spring',
			damping: 10,
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
			damping: 5,
			mass: 1,
			overshootClamping: false,
			stiffness: 120,
		},
	},
];
