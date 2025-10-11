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

export type AnimatedImageFillMode = 'contain' | 'cover' | 'fill';
