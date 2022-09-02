import type {CSSProperties} from 'react';

export type LottieAnimationData = {
	fr: number;
	w: number;
	h: number;
	op: number;
} & Record<string | number | symbol, unknown>;

export type LottieProps = {
	/**
	 * JSON object with the animation data.
	 * */
	animationData: LottieAnimationData;
	/**
	 * CSS classes to apply on the container of the animation.
	 */
	className?: string;
	/**
	 * The direction of the animation. Defaults to forward.
	 */
	direction?: 'forward' | 'backward';
	/**
	 * If the animation should loop after its end.
	 */
	loop?: boolean;
	/**
	 * The speed of the animation. Defaults to 1.
	 */
	playbackRate?: number;
	/**
	 * CSS properties to apply to the container of the animation.
	 */
	style?: CSSProperties;
};
