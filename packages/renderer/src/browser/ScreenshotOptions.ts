export interface ScreenshotOptions {
	type: 'png' | 'jpeg';
	path?: string;
	quality?: number;
	omitBackground: boolean;
	scale: number;
	width: number;
	height: number;
}
