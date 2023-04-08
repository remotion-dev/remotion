// Must keep this file synced with payloads.rs!
export type Layer =
	| {
			type: 'PngImage';
			params: {
				src: string;
				x: number;
				y: number;
				width: number;
				height: number;
			};
	  }
	| {
			type: 'JpgImage';
			params: {
				src: string;
				x: number;
				y: number;
				width: number;
				height: number;
			};
	  }
	| {
			type: 'Solid';
			params: {
				fill: [number, number, number, number];
				x: number;
				y: number;
				width: number;
				height: number;
			};
	  };

export type CompositorImageFormat = 'Png' | 'Jpeg';

export type CompositorCommand =
	| {
			type: 'Compose';
			params: {
				output: string;
				width: number;
				height: number;
				layers: Layer[];
				output_format: CompositorImageFormat;
			};
	  }
	| {
			type: 'ExtractFrame';
			params: {
				input: string;
				output: string;
				time: number;
			};
	  };

export type CliInputCommand = CompositorCommand & {
	type: 'StartLongRunningProcess';
	params: {};
};

export type ErrorPayload = {
	error: string;
	backtrace: string;
};
