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

export type CompositorCommand = {
	Compose: {
		output: string;
		width: number;
		height: number;
		layers: Layer[];
		output_format: CompositorImageFormat;
	};
	ExtractFrame: {
		input: string;
		time: number;
		transparent: boolean;
	};
	Echo: {
		message: string;
	};
	StartLongRunningProcess: {
		concurrency: number;
	};
	GetOpenVideoStats: {};
	DeliberatePanic: {};
};

export type CompositorCommandSerialized<T extends keyof CompositorCommand> = {
	nonce: string;
	payload: {
		type: T;
		params: CompositorCommand[T];
	};
};

export type ErrorPayload = {
	error: string;
	backtrace: string;
};
