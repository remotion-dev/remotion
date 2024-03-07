import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {PackageManager} from './package-manager';
import type {RequiredChromiumOptions} from './render-job';
import type {EnumPath} from './stringify-default-props';

export type OpenInFileExplorerRequest = {
	directory: string;
};

export type CopyStillToClipboardRequest = {
	outName: string;
	binariesDirectory: string | null;
};

type ReqAndRes<A, B> = {
	Request: A;
	Response: B;
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
			repro: boolean;
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
			repro: boolean;
			forSeamlessAacConcatenation: boolean;
			separateAudioTo: string | null;
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
	beepOnFinish: boolean;
} & AddRenderRequestDynamicFields;

export type RemoveRenderRequest = {
	jobId: string;
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

export type ApiRoutes = {
	'/api/cancel': ReqAndRes<CancelRenderRequest, CancelRenderResponse>;
	'/api/render': ReqAndRes<AddRenderRequest, undefined>;
	'/api/unsubscribe-from-file-existence': ReqAndRes<
		UnsubscribeFromFileExistenceRequest,
		undefined
	>;
	'/api/subscribe-to-file-existence': ReqAndRes<
		SubscribeToFileExistenceRequest,
		SubscribeToFileExistenceResponse
	>;
	'/api/remove-render': ReqAndRes<RemoveRenderRequest, undefined>;
	'/api/open-in-file-explorer': ReqAndRes<OpenInFileExplorerRequest, void>;
	'/api/copy-still-to-clipboard': ReqAndRes<CopyStillToClipboardRequest, void>;
	'/api/update-default-props': ReqAndRes<
		UpdateDefaultPropsRequest,
		UpdateDefaultPropsResponse
	>;
	'/api/can-update-default-props': ReqAndRes<
		CanUpdateDefaultPropsRequest,
		CanUpdateDefaultPropsResponse
	>;
	'/api/update-available': ReqAndRes<
		UpdateAvailableRequest,
		UpdateAvailableResponse
	>;
};
