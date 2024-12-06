export type RemotionAnimatedImageLoopBehavior =
	| 'loop'
	| 'pause-after-finish'
	| 'unmount-after-finish';

export type RemotionAnimatedImageProps = {
	src: string;
	width?: number;
	height?: number;
	onLoad?: (info: {
		width: number;
		height: number;
		delays: number[];
		frames: ImageData[];
	}) => void;
	onError?: (error: Error) => void;
	fit?: AnimatedImageFillMode;
	playbackRate?: number;
	style?: React.CSSProperties;
	loopBehavior?: RemotionAnimatedImageLoopBehavior;
	id?: string;
};

export type AnimatedImageFillMode = 'contain' | 'cover' | 'fill';
