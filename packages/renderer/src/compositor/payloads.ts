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

export type VideoMetadata = {
	fps: number;
	width: number;
	height: number;
	durationInSeconds: number;
	codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' | 'prores' | 'unknown';
	canPlayInVideoTag: boolean;
	supportsSeeking: boolean;
	colorSpace:
		| 'rgb'
		| 'bt601'
		| 'bt709'
		| 'bt2020-ncl'
		| 'bt2020-cl'
		| 'fcc'
		| 'bt470bg'
		| 'smpte170m'
		| 'smpte240m'
		| 'ycgco'
		| 'smpte2085'
		| 'chroma-derived-ncl'
		| 'chroma-derived-cl'
		| 'ictcp'
		| 'unknown';
};

type SilentPart = {
	startInSeconds: number;
	endInSeconds: number;
};

export type SilentParts = SilentPart[];

export type GetSilentPartsResponseRust = {
	silentParts: SilentParts;
	durationInSeconds: number;
};

export type GetSilentPartsResponse = GetSilentPartsResponseRust & {
	audibleParts: SilentParts;
};

export type CompositorCommand = {
	Compose: {
		output: string;
		width: number;
		height: number;
		layers: Layer[];
		output_format: CompositorImageFormat;
	};
	ExtractFrame: {
		src: string;
		original_src: string;
		time: number;
		transparent: boolean;
	};
	GetSilences: {
		src: string;
		noiseThresholdInDecibels: number;
		minDurationInSeconds: number;
	};
	Echo: {
		message: string;
	};
	StartLongRunningProcess: {
		concurrency: number;
		maximum_frame_cache_size_in_bytes: number | null;
		verbose: boolean;
	};
	CopyImageToClipboard: {
		src: string;
	};
	GetOpenVideoStats: {};
	DeliberatePanic: {};
	CloseAllVideos: {};
	FreeUpMemory: {
		remaining_bytes: number;
	};
	GetVideoMetadata: {src: string};
	VideoMetadata: VideoMetadata;
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
