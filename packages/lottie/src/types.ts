import type {AnimationItem} from 'lottie-web';
import type {CSSProperties} from 'react';

export type LottieAnimationData = {
	fr: number;
	w: number;
	h: number;
	op: number;
} & Record<string | number | symbol, unknown>;

export type AspectRatioConstraint =
	| 'none'
	| 'xMinYMin'
	| 'xMidYMin'
	| 'xMaxYMin'
	| 'xMinYMid'
	| 'xMidYMid'
	| 'xMaxYMid'
	| 'xMinYMax'
	| 'xMidYMax';

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
	/**
	 * The render engine of the Lotti files.
	 */
	renderer?: 'svg' | 'canvas' | 'html';
	/**
	 * for svg and canvas renderer it simulates the behavior of the preserveAspectRatio property on svgs.
	 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
	 */

	preserveAspectRatio?:
		| AspectRatioConstraint
		| `${AspectRatioConstraint} ${'slice' | 'meet'}`;

	assetsPath?: string;

	/**
	 * Callback that gets invoked when new animation data has been initialized
	 */
	onAnimationLoaded?: (animation: AnimationItem) => void;
};
