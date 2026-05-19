import type {EffectsProp} from '../effects/effect-types.js';
import type {SequenceProps} from '../Sequence.js';

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
};

export type AnimatedImageProps = Omit<
	SequenceProps,
	'children' | 'durationInFrames' | 'layout' | '_experimentalEffects'
> &
	RemotionAnimatedImageProps & {
		readonly durationInFrames?: number;
		readonly _experimentalEffects?: EffectsProp;
	};

export type AnimatedImageFillMode = 'contain' | 'cover' | 'fill';
