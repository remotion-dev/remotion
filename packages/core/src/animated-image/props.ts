import type {ImageFit} from '../calculate-image-fit.js';
import type {EffectsProp} from '../effects/effect-types.js';
import type {InteractiveBaseProps} from '../Interactive.js';

export type RemotionAnimatedImageLoopBehavior =
	| 'loop'
	| 'pause-after-finish'
	| 'clear-after-finish';

export type RemotionAnimatedImageProps = {
	src: string;
	width?: number;
	height?: number;
	onError?: (error: Error) => void;
	fit?: AnimatedImageFillMode;
	playbackRate?: number;
	style?: React.CSSProperties;
	loopBehavior?: RemotionAnimatedImageLoopBehavior;
	id?: string;
	className?: string;
	requestInit?: RequestInit;
};

export type AnimatedImageProps = InteractiveBaseProps &
	RemotionAnimatedImageProps & {
		readonly effects?: EffectsProp;
	};

export type AnimatedImageFillMode = ImageFit;
