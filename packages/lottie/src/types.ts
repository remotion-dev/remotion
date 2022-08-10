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
	 * The direction of the animation. 1 is forward, -1 is reverse.
	 */
	direction?: 1 | -1;
	/**
	 * If the animation should loop after its end.
	 */
	loop?: boolean;
	/**
	 * The speed of the animation. Defaults to 1.
	 */
	playbackRate?: number;
	/**
	 * CSS classes to apply on the container of the animation.
	 */
	className?: string;
	/**
	 * CSS properties to apply on the container of the animation.
	 */
	style?: CSSProperties;
};
