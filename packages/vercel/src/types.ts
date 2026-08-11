import type {Sandbox} from '@vercel/sandbox';

export type VercelSandbox = Sandbox & AsyncDisposable;

export type CreateSandboxOnProgress = (update: {
	progress: number;
	message: string;
}) => Promise<void> | void;

export type {
	AudioCodec,
	Bitrate,
	ChromeMode,
	ChromiumOptions,
	Codec,
	ColorSpace,
	FrameRange,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	RenderMediaOnProgress,
	RenderMediaProgress,
	StillImageFormat,
	StitchingState,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';

import type {RenderMediaProgress} from '@remotion/renderer';

export type RenderMediaOnVercelProgress =
	| {stage: 'opening-browser'; overallProgress: number}
	| {stage: 'selecting-composition'; overallProgress: number}
	| {
			stage: 'render-progress';
			progress: RenderMediaProgress;
			overallProgress: number;
	  };

export type RenderProgress =
	| {stage: 'starting'; overallProgress: number}
	| RenderMediaOnVercelProgress
	| {stage: 'uploading'; overallProgress: number}
	| {
			stage: 'done';
			url: string;
			size: number;
			contentType: string;
			overallProgress: number;
	  }
	| {stage: 'error'; message: string; overallProgress: number}
	| {stage: 'expired'};

export type RenderStillOnVercelProgress =
	| {stage: 'opening-browser'; overallProgress: number}
	| {stage: 'selecting-composition'; overallProgress: number};

export type {
	HardwareAccelerationOption,
	ProResProfile,
} from '@remotion/renderer/client';

export type VercelBlobAccess = 'public' | 'private';

export type VercelBlobUploadOptions = {
	blobToken: string;
	access: VercelBlobAccess;
	blobPath?: string;
};

export type SandboxRenderMediaMessage =
	| RenderMediaOnVercelProgress
	| {stage: 'render-complete'; overallProgress: number}
	| {stage: 'uploading'; overallProgress: number}
	| {
			stage: 'done';
			size: number;
			contentType: string;
			overallProgress: number;
			url?: string;
	  }
	| {stage: 'error'; message: string; overallProgress: number};

export type SandboxRenderStillMessage =
	| {type: 'opening-browser'}
	| {type: 'selecting-composition'}
	| {type: 'render-complete'}
	| {type: 'done'; size: number; contentType: string};
