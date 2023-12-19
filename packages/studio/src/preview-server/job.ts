import type {EnumPath} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';

import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	makeCancelSignal,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	StitchingState,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {RequiredChromiumOptions} from '../required-chromium-options';
import type {PackageManager} from './get-package-manager';

type BaseRenderProgress = {
	message: string;
	value: number;
};

export type RenderStep = 'bundling' | 'rendering' | 'stitching';

export type DownloadProgress = {
	name: string;
	id: number;
	progress: number | null;
	totalBytes: number | null;
	downloaded: number;
};

export type RenderingProgressInput = {
	frames: number;
	totalFrames: number;
	steps: RenderStep[];
	concurrency: number;
	doneIn: number | null;
};

export type StitchingProgressInput = {
	frames: number;
	totalFrames: number;
	doneIn: number | null;
	stage: StitchingState;
	codec: Codec;
};

type RenderJobDynamicStatus =
	| {
			status: 'done';
			progress: BaseRenderProgress & AggregateRenderProgress;
	  }
	| {
			status: 'running';
			progress: BaseRenderProgress & AggregateRenderProgress;
	  }
	| {
			status: 'idle';
	  }
	| {
			status: 'failed';
			error: {
				message: string;
				stack: string | undefined;
			};
	  };

export type CopyingState = {
	bytes: number;
	doneIn: number | null;
};

export type BundlingState = {
	progress: number;
	doneIn: number | null;
};

export type AggregateRenderProgress = {
	rendering: RenderingProgressInput | null;
	stitching: StitchingProgressInput | null;
	downloads: DownloadProgress[];
	bundling: BundlingState;
	copyingState: CopyingState;
};

export type JobProgressCallback = (
	options: BaseRenderProgress & AggregateRenderProgress,
) => void;

type RenderJobDynamicFields =
	| ({
			type: 'still';
			imageFormat: StillImageFormat;
			jpegQuality: number;
			frame: number;
			scale: number;
			offthreadVideoCacheSizeInBytes: number | null;
	  } & RenderJobDynamicStatus)
	| ({
			type: 'sequence';
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			concurrency: number;
			startFrame: number;
			endFrame: number;
			offthreadVideoCacheSizeInBytes: number | null;
	  } & RenderJobDynamicStatus)
	| ({
			type: 'video';
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			codec: Codec;
			audioCodec: AudioCodec;
			concurrency: number;
			crf: number | null;
			startFrame: number;
			endFrame: number;
			muted: boolean;
			enforceAudioTrack: boolean;
			proResProfile: ProResProfile | null;
			x264Preset: X264Preset | null;
			pixelFormat: PixelFormat;
			audioBitrate: string | null;
			videoBitrate: string | null;
			encodingBufferSize: string | null;
			encodingMaxRate: string | null;
			everyNthFrame: number;
			numberOfGifLoops: number | null;
			disallowParallelEncoding: boolean;
			offthreadVideoCacheSizeInBytes: number | null;
			colorSpace: ColorSpace;
	  } & RenderJobDynamicStatus);

export type RenderJob = {
	startedAt: number;
	compositionId: string;
	id: string;
	outName: string;
	deletedOutputLocation: boolean;
	logLevel: LogLevel;
	delayRenderTimeout: number;
	cancelToken: ReturnType<typeof makeCancelSignal>;
	chromiumOptions: RequiredChromiumOptions;
	envVariables: Record<string, string>;
	serializedInputPropsWithCustomSchema: string;
	multiProcessOnLinux: boolean;
} & RenderJobDynamicFields;

export type RenderJobWithCleanup = RenderJob & {
	cleanup: (() => void)[];
};

type AddRenderRequestDynamicFields =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			jpegQuality: number;
			frame: number;
			scale: number;
			logLevel: LogLevel;
	  }
	| {
			type: 'sequence';
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			logLevel: LogLevel;
			concurrency: number;
			startFrame: number;
			endFrame: number;
			disallowParallelEncoding: boolean;
	  }
	| {
			type: 'video';
			codec: Codec;
			audioCodec: AudioCodec;
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			logLevel: LogLevel;
			concurrency: number;
			crf: number | null;
			startFrame: number;
			endFrame: number;
			muted: boolean;
			enforceAudioTrack: boolean;
			proResProfile: ProResProfile | null;
			x264Preset: X264Preset | null;
			pixelFormat: PixelFormat;
			audioBitrate: string | null;
			videoBitrate: string | null;
			encodingBufferSize: string | null;
			encodingMaxRate: string | null;
			everyNthFrame: number;
			numberOfGifLoops: number | null;
			disallowParallelEncoding: boolean;
			colorSpace: ColorSpace;
	  };

export type CancelRenderRequest = {
	jobId: string;
};
export type CancelRenderResponse = {};

export type AddRenderRequest = {
	compositionId: string;
	outName: string;
	chromiumOptions: RequiredChromiumOptions;
	delayRenderTimeout: number;
	envVariables: Record<string, string>;
	serializedInputPropsWithCustomSchema: string;
	offthreadVideoCacheSizeInBytes: number | null;
	multiProcessOnLinux: boolean;
} & AddRenderRequestDynamicFields;

export type RemoveRenderRequest = {
	jobId: string;
};

export type OpenInFileExplorerRequest = {
	directory: string;
};

export type CopyStillToClipboardRequest = {
	outName: string;
};

export type SubscribeToFileExistenceRequest = {
	file: string;
	clientId: string;
};

export type SubscribeToFileExistenceResponse = {
	exists: boolean;
};

export type UnsubscribeFromFileExistenceRequest = {
	file: string;
	clientId: string;
};

export type UpdateDefaultPropsRequest = {
	compositionId: string;
	defaultProps: string;
	enumPaths: EnumPath[];
};

export type UpdateDefaultPropsResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type CanUpdateDefaultPropsRequest = {
	compositionId: string;
};

export type CanUpdateDefaultPropsResponse =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
	  };

export type UpdateAvailableRequest = {};
export type UpdateAvailableResponse = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};
