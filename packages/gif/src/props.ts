export type RemotionGifProps = {
	src: string;
	width?: number;
	height?: number;
	fit?: 'contain' | 'fill' | 'cover';
	style?: React.CSSProperties;
};

export type GifState = {
	delays: number[];
	frames: ImageData[];
	width: number;
	height: number;
};
