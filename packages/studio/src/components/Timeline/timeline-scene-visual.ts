export type TimelineSceneText = {
	readonly text: string;
	readonly x: number;
	readonly y: number;
	readonly height: number;
	readonly color: string;
	readonly fontFamily: string;
	readonly fontSize: number;
	readonly fontWeight: string;
	readonly fontStyle: string;
	readonly letterSpacing: number;
	readonly decoration: string;
};

export type TimelineSceneVisual = {
	readonly checkerboard: {readonly size: number; readonly color: string} | null;
	readonly image: {
		readonly getResource: () => HTMLImageElement;
		readonly src: string;
		readonly width: number;
		readonly height: number;
		readonly fit: string;
		readonly position: string;
	} | null;
	readonly borders: readonly {width: number; color: string; style: string}[];
	readonly outline: {width: number; color: string; offset: number} | null;
	readonly shadow: string;
	readonly texts: readonly TimelineSceneText[];
	readonly paths: readonly {
		path: string;
		matrix: readonly [number, number, number, number, number, number];
		fill: string;
		fillAlpha: number;
		stroke: string;
		strokeAlpha: number;
		strokeWidth: number;
		lineCap: string;
		lineJoin: string;
		fillRule: string;
		blur: number;
	}[];
	readonly selection: {
		x: number;
		y: number;
		width: number;
		height: number;
		color: string;
	} | null;
	readonly caret: {x: number; y: number; height: number; color: string} | null;
	readonly range: {progress: number; color: string} | null;
	readonly alphaMasks: readonly {
		left: number;
		right: number;
		start: number;
		end: number;
		startAlpha: number;
		endAlpha: number;
	}[];
	readonly scrollbars: readonly {
		readonly vertical: boolean;
		readonly thickness: number;
		readonly color: string;
		readonly getScroll: () => {left: number; width: number; totalWidth: number};
	}[];
};
