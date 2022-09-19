export type RemotionGifProps = {
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
	fit?: 'contain' | 'fill' | 'cover';
	style?: React.CSSProperties;
};

export type GifState = {
	delays: number[];
	frames: ImageData[];
	width: number;
	height: number;
};
