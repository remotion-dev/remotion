import type {
	AudioCodec,
	ChromiumOptions,
	ColorSpace,
	FrameRange,
	LogLevel,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	ToOptions,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import type {VideoConfig} from 'remotion/no-react';
import type {ChunkRetry} from '../functions/helpers/get-retry-stats';
import type {DeleteAfter} from '../functions/helpers/lifecycle';
import type {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';
import type {AwsRegion} from '../pricing/aws-regions';
import type {
	CustomCredentials,
	CustomCredentialsWithoutSensitiveData,
} from './aws-clients';
import type {DownloadBehavior} from './content-disposition-header';
import type {ExpensiveChunk} from './get-most-expensive-chunks';
import type {LambdaCodec} from './validate-lambda-codec';

export const MIN_MEMORY = 512;
export const MAX_MEMORY = 10240;
export const DEFAULT_MEMORY_SIZE = 2048;

export const DEFAULT_TIMEOUT = 120;
export const MIN_TIMEOUT = 15;
export const MAX_TIMEOUT = 900;

export const MINIMUM_FRAMES_PER_LAMBDA = 4;
export const DEFAULT_FRAMES_PER_LAMBDA = 20;

export const BINARY_NAME = 'remotion lambda';
export const COMMAND_NOT_FOUND = 'Command not found';
export const DEFAULT_REGION: AwsRegion = 'us-east-1';
export const DEFAULT_MAX_RETRIES = 1;

export const MAX_FUNCTIONS_PER_RENDER = 200;

export const DEFAULT_EPHEMERAL_STORAGE_IN_MB = 2048;
export const MIN_EPHEMERAL_STORAGE_IN_MB = 512;
export const MAX_EPHEMERAL_STORAGE_IN_MB = 10240;

export const DEFAULT_OUTPUT_PRIVACY: Privacy = 'public';

export const DEFAULT_CLOUDWATCH_RETENTION_PERIOD = 14;

export const REMOTION_BUCKET_PREFIX = 'remotionlambda-';
export const RENDER_FN_PREFIX = 'remotion-render-';
export const LOG_GROUP_PREFIX = '/aws/lambda/';
export const LAMBDA_INSIGHTS_PREFIX = '/aws/lambda-insights';
export const rendersPrefix = (renderId: string) => `renders/${renderId}`;
export const renderMetadataKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/pre-render-metadata.json`;
export const initalizedMetadataKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/initialized.txt`;
export const overallProgressKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/overall-progress.json`;

export const lambdaTimingsPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/lambda-timings/chunk:`;

export const lambdaTimingsPrefixForChunk = (renderId: string, chunk: number) =>
	lambdaTimingsPrefix(renderId) + String(chunk).padStart(8, '0');

export const lambdaLogsPrefix = (
	renderId: string,
	chunk: number,
	startFrame: number,
	endFrame: number,
) =>
	`${rendersPrefix(renderId)}/logs/chunk:${String(chunk).padStart(
		8,
		'0',
	)}:frames:${startFrame}-${endFrame}.json`;

export const lambdaTimingsKey = ({
	renderId,
	chunk,
	start,
	rendered,
}: {
	renderId: string;
	chunk: number;
	start: number;
	rendered: number;
}) =>
	`${lambdaTimingsPrefixForChunk(
		renderId,
		chunk,
	)}-start:${start}-rendered:${rendered}.txt`;
export const chunkKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/chunks/chunk`;
export const chunkKeyForIndex = ({
	index,
	type,
}: {
	index: number;
	type: 'video' | 'audio';
}) => `chunk:${String(index).padStart(8, '0')}:${type}`;

export const getErrorKeyPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/errors/`;

export const getErrorFileName = ({
	renderId,
	chunk,
	attempt,
}: {
	renderId: string;
	chunk: number | null;
	attempt: number;
}) => getErrorKeyPrefix(renderId) + ':chunk-' + chunk + ':attempt-' + attempt;

export type OutNameInput =
	| string
	| {
			bucketName: string;
			key: string;
			s3OutputProvider?: CustomCredentials;
	  };

export type OutNameInputWithoutCredentials =
	| string
	| {
			bucketName: string;
			key: string;
			s3OutputProvider?: CustomCredentialsWithoutSensitiveData;
	  };

export type OutNameOutput = {
	renderBucketName: string;
	key: string;
	customCredentials: CustomCredentials | null;
};

export const getSitesKey = (siteId: string) => `sites/${siteId}`;
export const outName = (renderId: string, extension: string) =>
	`${rendersPrefix(renderId)}/out.${extension}`;
export const outStillName = (renderId: string, imageFormat: StillImageFormat) =>
	`${rendersPrefix(renderId)}/out.${imageFormat}`;
export const customOutName = (
	renderId: string,
	bucketName: string,
	name: OutNameInput,
): OutNameOutput => {
	if (typeof name === 'string') {
		return {
			renderBucketName: bucketName,
			key: `${rendersPrefix(renderId)}/${name}`,
			customCredentials: null,
		};
	}

	return {
		key: name.key,
		renderBucketName: name.bucketName,
		customCredentials: name.s3OutputProvider ?? null,
	};
};

export const postRenderDataKey = (renderId: string) => {
	return `${rendersPrefix(renderId)}/post-render-metadata.json`;
};

export const defaultPropsKey = (hash: string) => {
	return `default-props/${hash}.json`;
};

export const inputPropsKey = (hash: string) => {
	return `input-props/${hash}.json`;
};

export const resolvedPropsKey = (hash: string) => {
	return `resolved-props/${hash}.json`;
};

export const RENDERER_PATH_TOKEN = 'remotion-bucket';
export const CONCAT_FOLDER_TOKEN = 'remotion-concat';
export const REMOTION_CONCATED_TOKEN = 'remotion-concated-token';
export const REMOTION_FILELIST_TOKEN = 'remotion-filelist';

export enum LambdaRoutines {
	info = 'info',
	start = 'start',
	launch = 'launch',
	status = 'status',
	renderer = 'renderer',
	still = 'still',
	compositions = 'compositions',
}

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type WebhookOption = Prettify<
	| null
	| ({
			url: string;
			secret: string | null;
	  } & Partial<
			ToOptions<{
				customData: typeof BrowserSafeApis.options.webhookCustomDataOption;
			}>
	  >)
>;

export type SerializedInputProps =
	| {
			type: 'bucket-url';
			hash: string;
	  }
	| {
			type: 'payload';
			payload: string;
	  };

export type LambdaStartPayload = {
	rendererFunctionName: string | null;
	type: LambdaRoutines.start;
	serveUrl: string;
	composition: string;
	framesPerLambda: number | null;
	inputProps: SerializedInputProps;
	codec: LambdaCodec;
	audioCodec: AudioCodec | null;
	imageFormat: VideoImageFormat;
	crf: number | undefined;
	envVariables: Record<string, string> | undefined;
	pixelFormat: PixelFormat | undefined;
	proResProfile: ProResProfile | undefined;
	x264Preset: X264Preset | null;
	jpegQuality: number | undefined;
	maxRetries: number;
	privacy: Privacy;
	logLevel: LogLevel;
	frameRange: FrameRange | null;
	outName: OutNameInput | null;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	scale: number;
	everyNthFrame: number;
	numberOfGifLoops: number | null;
	concurrencyPerLambda: number;
	downloadBehavior: DownloadBehavior;
	muted: boolean;
	version: string;
	overwrite: boolean;
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	webhook: WebhookOption;
	forceHeight: number | null;
	forceWidth: number | null;
	bucketName: string | null;
	offthreadVideoCacheSizeInBytes: number | null;
	deleteAfter: DeleteAfter | null;
	colorSpace: ColorSpace | null;
	preferLossless: boolean;
};

export type LambdaStatusPayload = {
	type: LambdaRoutines.status;
	bucketName: string;
	renderId: string;
	version: string;
	logLevel: LogLevel;
	s3OutputProvider?: CustomCredentials;
};

export type LambdaPayloads = {
	info: {
		type: LambdaRoutines.info;
		logLevel: LogLevel;
	};
	start: LambdaStartPayload;
	launch: {
		rendererFunctionName: string | null;
		type: LambdaRoutines.launch;
		serveUrl: string;
		composition: string;
		framesPerLambda: number | null;
		bucketName: string;
		inputProps: SerializedInputProps;
		renderId: string;
		imageFormat: VideoImageFormat;
		codec: LambdaCodec;
		audioCodec: AudioCodec | null;
		crf: number | undefined;
		envVariables: Record<string, string> | undefined;
		pixelFormat: PixelFormat | undefined;
		proResProfile: ProResProfile | undefined;
		x264Preset: X264Preset | null;
		jpegQuality: number | undefined;
		maxRetries: number;
		privacy: Privacy;
		logLevel: LogLevel;
		frameRange: FrameRange | null;
		outName: OutNameInput | null;
		timeoutInMilliseconds: number;
		chromiumOptions: ChromiumOptions;
		scale: number;
		everyNthFrame: number;
		numberOfGifLoops: number | null;
		concurrencyPerLambda: number;
		downloadBehavior: DownloadBehavior;
		muted: boolean;
		overwrite: boolean;
		audioBitrate: string | null;
		videoBitrate: string | null;
		encodingMaxRate: string | null;
		encodingBufferSize: string | null;
		webhook: WebhookOption;
		forceHeight: number | null;
		forceWidth: number | null;
		offthreadVideoCacheSizeInBytes: number | null;
		deleteAfter: DeleteAfter | null;
		colorSpace: ColorSpace | null;
		preferLossless: boolean;
	};
	status: LambdaStatusPayload;
	renderer: {
		concurrencyPerLambda: number;
		type: LambdaRoutines.renderer;
		serveUrl: string;
		frameRange: [number, number];
		chunk: number;
		bucketName: string;
		composition: string;
		fps: number;
		height: number;
		width: number;
		durationInFrames: number;
		retriesLeft: number;
		inputProps: SerializedInputProps;
		renderId: string;
		imageFormat: VideoImageFormat;
		codec: LambdaCodec;
		crf: number | undefined;
		proResProfile: ProResProfile | undefined;
		x264Preset: X264Preset | null;
		pixelFormat: PixelFormat | undefined;
		jpegQuality: number | undefined;
		envVariables: Record<string, string> | undefined;
		privacy: Privacy;
		attempt: number;
		logLevel: LogLevel;
		timeoutInMilliseconds: number;
		chromiumOptions: ChromiumOptions;
		resolvedProps: SerializedInputProps;
		scale: number;
		everyNthFrame: number;
		muted: boolean;
		audioBitrate: string | null;
		videoBitrate: string | null;
		encodingBufferSize: string | null;
		encodingMaxRate: string | null;
		launchFunctionConfig: {
			version: string;
		};
		preferLossless: boolean;
		offthreadVideoCacheSizeInBytes: number | null;
		deleteAfter: DeleteAfter | null;
		colorSpace: ColorSpace | null;
		compositionStart: number;
		framesPerLambda: number;
	};
	still: {
		type: LambdaRoutines.still;
		serveUrl: string;
		composition: string;
		inputProps: SerializedInputProps;
		imageFormat: StillImageFormat;
		envVariables: Record<string, string>;
		attempt: number;
		jpegQuality: number | undefined;
		maxRetries: number;
		frame: number;
		privacy: Privacy;
		logLevel: LogLevel;
		outName: OutNameInput | null;
		timeoutInMilliseconds: number;
		chromiumOptions: ChromiumOptions;
		scale: number;
		downloadBehavior: DownloadBehavior;
		version: string;
		forceHeight: number | null;
		forceWidth: number | null;
		bucketName: string | null;
		offthreadVideoCacheSizeInBytes: number | null;
		deleteAfter: DeleteAfter | null;
	};
	compositions: {
		type: LambdaRoutines.compositions;
		version: string;
		chromiumOptions: ChromiumOptions;
		logLevel: LogLevel;
		inputProps: SerializedInputProps;
		envVariables: Record<string, string> | undefined;
		timeoutInMilliseconds: number;
		serveUrl: string;
		bucketName: string | null;
		offthreadVideoCacheSizeInBytes: number | null;
	};
};

export type LambdaPayload = LambdaPayloads[LambdaRoutines];

export type EncodingProgress = {
	framesEncoded: number;
	combinedFrames: number;
	timeToCombine: number | null;
};

type Discriminated =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			codec: null;
	  }
	| {
			type: 'video';
			imageFormat: VideoImageFormat;
			muted: boolean;
			frameRange: [number, number];
			everyNthFrame: number;
			codec: LambdaCodec;
	  };

export type RenderMetadata = Discriminated & {
	siteId: string;
	videoConfig: VideoConfig;
	startedDate: number;
	totalChunks: number;
	estimatedTotalLambdaInvokations: number;
	estimatedRenderLambdaInvokations: number;
	compositionId: string;
	audioCodec: AudioCodec | null;
	inputProps: SerializedInputProps;
	framesPerLambda: number;
	memorySizeInMb: number;
	lambdaVersion: string;
	region: AwsRegion;
	renderId: string;
	outName: OutNameInputWithoutCredentials | undefined;
	privacy: Privacy;
	deleteAfter: DeleteAfter | null;
	numberOfGifLoops: number | null;
	audioBitrate: string | null;
	downloadBehavior: DownloadBehavior;
};

export type AfterRenderCost = {
	estimatedCost: number;
	estimatedDisplayCost: string;
	currency: string;
	disclaimer: string;
};

export type PostRenderData = {
	cost: AfterRenderCost;
	outputFile: string;
	outputSize: number;
	renderSize: number;
	timeToFinish: number;
	errors: EnhancedErrorInfo[];
	startTime: number;
	endTime: number;
	filesCleanedUp: number;
	renderMetadata: RenderMetadata;
	timeToEncode: number;
	timeToCleanUp: number;
	timeToRenderChunks: number;
	retriesInfo: ChunkRetry[];
	mostExpensiveFrameRanges: ExpensiveChunk[] | undefined;
	estimatedBillingDurationInMilliseconds: number;
	deleteAfter: DeleteAfter | null;
	timeToCombine: number | null;
};

export type CostsInfo = {
	accruedSoFar: number;
	displayCost: string;
	currency: string;
	disclaimer: string;
};

export type CleanupInfo = {
	doneIn: number | null;
	minFilesToDelete: number;
	filesDeleted: number;
};

export type RenderProgress = {
	chunks: number;
	done: boolean;
	encodingStatus: EncodingProgress | null;
	costs: CostsInfo;
	renderId: string;
	renderMetadata: RenderMetadata | null;
	bucket: string;
	outputFile: string | null;
	outKey: string | null;
	outBucket: string | null;
	timeToFinish: number | null;
	errors: EnhancedErrorInfo[];
	fatalErrorEncountered: boolean;
	currentTime: number;
	renderSize: number;
	lambdasInvoked: number;
	cleanup: CleanupInfo | null;
	timeToFinishChunks: number | null;
	timeToEncode: number | null;
	overallProgress: number;
	retriesInfo: ChunkRetry[];
	mostExpensiveFrameRanges: ExpensiveChunk[] | null;
	framesRendered: number;
	outputSizeInBytes: number | null;
	type: 'success';
	estimatedBillingDurationInMilliseconds: number | null;
	combinedFrames: number;
	timeToCombine: number | null;
};

export type Privacy = 'public' | 'private' | 'no-acl';

export const LAMBDA_CONCURRENCY_LIMIT_QUOTA = 'L-B99A9384';
