export interface ScreenshotOptions {
	type: 'png' | 'jpeg';
	path?: string;
	quality?: number;
	omitBackground: boolean;
	width: number;
	height: number;
}
