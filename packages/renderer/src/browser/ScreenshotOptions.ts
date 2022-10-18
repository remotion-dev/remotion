interface ScreenshotClip {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ScreenshotOptions {
	type: 'png' | 'jpeg';
	path?: string;
	clip?: ScreenshotClip;
	quality?: number;
	omitBackground: boolean;
}
