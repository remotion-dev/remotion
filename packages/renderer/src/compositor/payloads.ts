export type CompositorImageFormat = 'Png' | 'Jpeg';

export type VideoMetadata = {
	fps: number;
	width: number;
	height: number;
	durationInSeconds: number | null;
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
	audioCodec:
		| null
		| 'opus'
		| 'aac'
		| 'mp3'
		| 'pcm-f16le'
		| 'pcm-f24le'
		| 'pcm-f32be'
		| 'pcm-s16be'
		| 'pcm-s16le'
		| 'pcm-f32le'
		| 'pcm-s32be'
		| 'pcm-s32le'
		| 'pcm-s64be'
		| 'pcm-s64le'
		| 'pcm-u16be'
		| 'pcm-u16le'
		| 'pcm-u24be'
		| 'pcm-u24le'
		| 'pcm-u32be'
		| 'pcm-u32le'
		| 'pcm-u8'
		| 'pcm-f64be'
		| 'pcm-s24be'
		| 'pcm-s24le'
		| 'pcm-s8'
		| 'pcm-s16be-planar'
		| 'pcm-s8-planar'
		| 'pcm-s24le-planar'
		| 'pcm-s32le-planar'
		| 'unknown';
	audioFileExtension: string | null;
	pixelFormat:
		| null
		| 'yuv420p'
		| 'yuyv422'
		| 'rgb24'
		| 'bgr24'
		| 'yuv422p'
		| 'yuv444p'
		| 'yuv410p'
		| 'yuv411p'
		| 'yuvj420p'
		| 'yuvj422p'
		| 'yuvj444p'
		| 'argb'
		| 'rgba'
		| 'abgr'
		| 'bgra'
		| 'yuv440p'
		| 'yuvj440p'
		| 'yuva420p'
		| 'yuv420p16le'
		| 'yuv420p16be'
		| 'yuv422p16le'
		| 'yuv422p16be'
		| 'yuv444p16le'
		| 'yuv444p16be'
		| 'yuv420p9be'
		| 'yuv420p9le'
		| 'yuv420p10be'
		| 'yuv420p10le'
		| 'yuv422p10be'
		| 'yuv422p10le'
		| 'yuv444p9be'
		| 'yuv444p9le'
		| 'yuv444p10be'
		| 'yuv444p10le'
		| 'yuv422p9be'
		| 'yuv422p9le'
		| 'yuva420p9be'
		| 'yuva420p9le'
		| 'yuva422p9be'
		| 'yuva422p9le'
		| 'yuva444p9be'
		| 'yuva444p9le'
		| 'yuva420p10be'
		| 'yuva420p10le'
		| 'yuva422p10be'
		| 'yuva422p10le'
		| 'yuva444p10be'
		| 'yuva444p10le'
		| 'yuva420p16be'
		| 'yuva420p16le'
		| 'yuva422p16be'
		| 'yuva422p16le'
		| 'yuva444p16be'
		| 'yuva444p16le'
		| 'yuva444p'
		| 'yuva422p'
		| 'yuv420p12be'
		| 'yuv420p12le'
		| 'yuv420p14be'
		| 'yuv420p14le'
		| 'yuv422p12be'
		| 'yuv422p12le'
		| 'yuv422p14be'
		| 'yuv422p14le'
		| 'yuv444p12be'
		| 'yuv444p12le'
		| 'yuv444p14be'
		| 'yuv444p14le'
		| 'yuvj411p'
		| 'yuv440p10le'
		| 'yuv440p10be'
		| 'yuv440p12le'
		| 'yuv440p12be'
		| 'yuv420p9'
		| 'yuv422p9'
		| 'yuv444p9'
		| 'yuv420p10'
		| 'yuv422p10'
		| 'yuv440p10'
		| 'yuv444p10'
		| 'yuv420p12'
		| 'yuv422p12'
		| 'yuv440p12'
		| 'yuv444p12'
		| 'yuv420p14'
		| 'yuv422p14'
		| 'yuv444p14'
		| 'yuv420p16'
		| 'yuv422p16'
		| 'yuv444p16'
		| 'yuva420p9'
		| 'yuva422p9'
		| 'yuva444p9'
		| 'yuva420p10'
		| 'yuva422p10'
		| 'yuva444p10'
		| 'yuva420p16'
		| 'yuva422p16'
		| 'yuva444p16'
		| 'yuva422p12be'
		| 'yuva422p12le'
		| 'yuva444p12be'
		| 'yuva444p12le'
		| 'unknown';
};

export type SilentPart = {
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
	ExtractFrame: {
		src: string;
		original_src: string;
		time: number;
		transparent: boolean;
		tone_mapped: boolean;
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
	GetOpenVideoStats: {};
	DeliberatePanic: {};
	CloseAllVideos: {};
	FreeUpMemory: {
		remaining_bytes: number;
	};
	GetVideoMetadata: {src: string};
	ExtractAudio: {input_path: string; output_path: string};
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
