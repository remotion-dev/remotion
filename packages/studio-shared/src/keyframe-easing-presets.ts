import type {CanUpdateSequencePropStatusEasing} from 'remotion';

export type KeyframeEasing = CanUpdateSequencePropStatusEasing;

export type KeyframeEasingPreset = {
	readonly id: 'ease-in' | 'ease-out' | 'ease-in-out';
	readonly label: string;
	readonly easing: KeyframeEasing;
};

export const KEYFRAME_EASING_PRESETS: KeyframeEasingPreset[] = [
	{id: 'ease-in', label: 'Ease in', easing: [0.42, 0, 1, 1]},
	{id: 'ease-out', label: 'Ease out', easing: [0, 0, 0.58, 1]},
	{id: 'ease-in-out', label: 'Ease in-out', easing: [0.42, 0, 0.58, 1]},
];
