import {
	Codec,
	ImageFormat,
	PixelFormat,
	ProResProfile,
	VideoConfig,
} from 'remotion';
import {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';
import {AwsRegion} from '../pricing/aws-regions';
import {getFileExtensionFromCodec} from './get-file-extension-from-codec';

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

// TODO: Rename other buckets in Jonnys accoudn first
export const REMOTION_BUCKET_PREFIX = 'remotionlambda-';
export const RENDER_FN_PREFIX = 'remotion-render-';
export const rendersPrefix = (renderId: string) => `renders/${renderId}`;
export const encodingProgressKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/encoding-progress.json`;
export const renderMetadataKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/pre-render-metadata.json`;
export const lambdaInitializedPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/lambda-initialized`;
export const lambdaInitializedKey = ({
	renderId,
	chunk,
}: {
	renderId: string;
	chunk: number;
}) => `${lambdaInitializedPrefix(renderId)}-${chunk}.txt`;
export const lambdaTimingsPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/lambda-timings/chunk:`;

export const lambdaTimingsPrefixForChunk = (renderId: string, chunk: number) =>
	lambdaTimingsPrefix(renderId) + String(chunk).padStart(8, '0');

export const lambdaLogsPrefix = (
	renderId: string,
	chunk: number,
	startFrame: number,
	endFrame: number
) =>
	`${rendersPrefix(renderId)}/logs/chunk:${String(chunk).padStart(
		8,
		'0'
	)}:frames:${startFrame}-${endFrame}.json`;

export const lambdaTimingsKey = ({
	renderId,
	chunk,
	start,
	rendered,
	encoded,
}: {
	renderId: string;
	chunk: number;
	start: number;
	rendered: number;
	encoded: number;
}) =>
	`${lambdaTimingsPrefixForChunk(
		renderId,
		chunk
	)}-start:${start}-rendered:${rendered}-encoded:${encoded}.txt`;
export const chunkKey = (renderId: string) =>
	`${rendersPrefix(renderId)}/chunks/chunk`;
export const chunkKeyForIndex = ({
	renderId,
	index,
}: {
	renderId: string;
	index: number;
}) => `${chunkKey(renderId)}:${String(index).padStart(8, '0')}`;

export const getErrorKeyPrefix = (renderId: string) =>
	`${rendersPrefix(renderId)}/errors/`;
export const optimizationProfile = (siteId: string, compositionId: string) =>
	`optimization-profiles/${siteId}/${compositionId}/optimization-profile`;
export const getSitesKey = (siteId: string) => `sites/${siteId}`;
export const outName = (renderId: string, codec: Codec) =>
	`${rendersPrefix(renderId)}/out.${getFileExtensionFromCodec(codec, 'final')}`;
export const outStillName = (renderId: string, imageFormat: ImageFormat) =>
	`${rendersPrefix(renderId)}/out.${imageFormat}`;

export const postRenderDataKey = (renderId: string) => {
	return `${rendersPrefix(renderId)}/post-render-metadata.json`;
};

export const DOWNLOADS_DIR = '/tmp/downloads';
export const OUTPUT_PATH_PREFIX = '/tmp/remotion-render-';
export const RENDERER_PATH_TOKEN = 'remotion-bucket';
export const RENDERER_PATH_PREFIX = '/tmp/' + RENDERER_PATH_TOKEN;

export const CONCAT_FOLDER_TOKEN = 'remotion-concat';
export const CONCAT_TMPDIR = '/tmp/' + CONCAT_FOLDER_TOKEN;

export const REMOTION_CONCATED_TOKEN = 'remotion-concated-token';
export const REMOTION_CONCATED_TMP_PREFIX = '/tmp/' + REMOTION_CONCATED_TOKEN;

export const REMOTION_FILELIST_TOKEN = 'remotion-filelist';
export const REMOTION_FILELIST_TMP_PREFIX = '/tmp' + REMOTION_FILELIST_TOKEN;

export enum LambdaRoutines {
	info = 'info',
	start = 'start',
	launch = 'launch',
	status = 'status',
	fire = 'fire',
	renderer = 'renderer',
	still = 'still',
}

export type LambdaPayloads = {
	info: {
		type: LambdaRoutines.info;
	};
	start: {
		type: LambdaRoutines.start;
		serveUrl: string;
		composition: string;
		framesPerLambda: number;
		inputProps: unknown;
		codec: Codec;
		imageFormat: ImageFormat;
		crf: number | undefined;
		envVariables: Record<string, string> | undefined;
		pixelFormat: PixelFormat | undefined;
		proResProfile: ProResProfile | undefined;
		quality: number | undefined;
		maxRetries: number;
		privacy: Privacy;
		enableChunkOptimization: boolean | undefined;
		saveBrowserLogs?: boolean;
	};
	launch: {
		type: LambdaRoutines.launch;
		serveUrl: string;
		composition: string;
		framesPerLambda: number;
		bucketName: string;
		inputProps: unknown;
		renderId: string;
		imageFormat: ImageFormat;
		codec: Codec;
		crf: number | undefined;
		envVariables: Record<string, string> | undefined;
		pixelFormat: PixelFormat | undefined;
		proResProfile: ProResProfile | undefined;
		quality: number | undefined;
		maxRetries: number;
		privacy: Privacy;
		enableChunkOptimization: boolean;
		saveBrowserLogs: boolean;
	};
	fire: {
		type: LambdaRoutines.fire;
		payloads: unknown[];
		renderId: string;
	};
	status: {
		type: LambdaRoutines.status;
		bucketName: string;
		renderId: string;
	};
	renderer: {
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
		inputProps: unknown;
		renderId: string;
		imageFormat: ImageFormat;
		codec: Codec;
		crf: number | undefined;
		proResProfile: ProResProfile | undefined;
		pixelFormat: PixelFormat | undefined;
		quality: number | undefined;
		envVariables: Record<string, string> | undefined;
		privacy: Privacy;
		saveBrowserLogs: boolean;
	};
	still: {
		type: LambdaRoutines.still;
		serveUrl: string;
		composition: string;
		inputProps: unknown;
		imageFormat: ImageFormat;
		envVariables: Record<string, string> | undefined;
		quality: number | undefined;
		maxRetries: number;
		frame: number;
		privacy: Privacy;
	};
};

export type LambdaPayload = LambdaPayloads[LambdaRoutines];

export type EncodingProgress = {
	framesEncoded: number;
	totalFrames: number | null;
	doneIn: number | null;
	timeToInvoke: number | null;
};

export type RenderMetadata = {
	siteId: string;
	videoConfig: VideoConfig;
	startedDate: number;
	totalChunks: number;
	estimatedTotalLambdaInvokations: number;
	estimatedRenderLambdaInvokations: number;
	compositionId: string;
	codec: Codec | null;
	usesOptimizationProfile: boolean;
	type: 'still' | 'video';
	imageFormat: ImageFormat;
	inputProps: unknown;
	framesPerLambda: number;
	memorySizeInMb: number;
	lambdaVersion: LambdaVersions;
	region: AwsRegion;
	renderId: string;
};

export type LambdaVersions =
	| '2021-11-10'
	| '2021-11-01'
	| '2021-10-29'
	| '2021-10-27'
	| '2021-10-21'
	| '2021-10-19'
	| '2021-10-07'
	| '2021-10-03'
	| '2021-10-01'
	| '2021-09-15'
	| '2021-09-06'
	| '2021-08-06'
	| '2021-07-14'
	| '2021-07-05'
	| '2021-07-02'
	| '2021-06-23'
	| 'n/a';

export const CURRENT_VERSION: LambdaVersions = '2021-11-10';

export type PostRenderData = {
	cost: {
		estimatedCost: number;
		estimatedDisplayCost: string;
		currency: string;
		disclaimer: string;
	};
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
	timeToInvokeLambdas: number;
};

export type CostsInfo = {
	accruedSoFar: number;
	displayCost: string;
	currency: string;
	disclaimer: string;
};

export type CleanupInfo = {
	doneIn: number | null;
	filesToDelete: number;
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
	timeToFinish: number | null;
	errors: EnhancedErrorInfo[];
	fatalErrorEncountered: boolean;
	currentTime: number;
	renderSize: number;
	lambdasInvoked: number;
	cleanup: CleanupInfo | null;
	timeToFinishChunks: number | null;
	timeToInvokeLambdas: number | null;
	overallProgress: number;
};

export type Privacy = 'public' | 'private';
