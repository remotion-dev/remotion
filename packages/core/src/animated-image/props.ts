import type {ImageFit} from '../calculate-image-fit.js';
import type {EffectsProp} from '../effects/effect-types.js';
import type {
	InteractiveBaseProps,
	InteractivePremountProps,
} from '../Interactive.js';

export type RemotionAnimatedImageLoopBehavior =
	| 'loop'
	| 'pause-after-finish'
	| 'clear-after-finish';

export type AnimatedImageCanvasProps = React.AriaAttributes &
	Record<`data-${string}`, string | undefined>;

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
} & AnimatedImageCanvasProps;

export type AnimatedImageProps = InteractiveBaseProps &
	InteractivePremountProps &
	RemotionAnimatedImageProps & {
		readonly effects?: EffectsProp;
	};

export type AnimatedImageFillMode = ImageFit;
