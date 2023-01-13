// Must keep this file synced with payloads.rs!
export type CompositorLayer =
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
			type: 'SvgImage';
			params: {
				markup: string;
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
	  }
	| {
			type: 'VideoFrame';
			params: {
				src: string;
				frame: number;
				x: number;
				y: number;
				width: number;
				height: number;
			};
	  };

export type CompositorImageFormat =
	| 'Png'
	| 'Jpeg'
	| 'Bmp'
	| 'Tiff'
	| 'AddToH264';

export type CompositorCommand = {
	v: number;
	output: string;
	width: number;
	height: number;
	layers: CompositorLayer[];
	output_format: CompositorImageFormat;
	nonce: number;
};

export type CompositorInitiatePayload = {
	create_h264_queue: boolean;
	video_signals: Record<string, Record<number, number>>;
	fps: number;
	duration_in_frames: number;
	width: number;
	height: number;
};

export type ErrorPayload = {
	error: string;
	backtrace: string;
	msg_type: 'error';
};

export type TaskDonePayload = {
	nonce: number;
	time: number;
	msg_type: 'finish';
};
