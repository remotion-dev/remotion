import {
	type DeleteAfter,
	type Privacy,
	type RenderMetadata,
} from '@remotion/serverless/client';
import type {ChunkRetry} from '../functions/helpers/get-retry-stats';
import type {ReceivedArtifact} from '../functions/helpers/overall-render-progress';
import type {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';
import type {AwsRegion} from '../regions';
import type {ExpensiveChunk} from './get-most-expensive-chunks';

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

export const RENDER_FN_PREFIX = 'remotion-render-';
export const LOG_GROUP_PREFIX = '/aws/lambda/';
export const LAMBDA_INSIGHTS_PREFIX = '/aws/lambda-insights';

export const getSitesKey = (siteId: string) => `sites/${siteId}`;

export const RENDERER_PATH_TOKEN = 'remotion-bucket';
export const CONCAT_FOLDER_TOKEN = 'remotion-concat';
export const REMOTION_CONCATED_TOKEN = 'remotion-concated-token';
export const REMOTION_FILELIST_TOKEN = 'remotion-filelist';

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
	timeToRenderFrames: number;
	errors: EnhancedErrorInfo[];
	startTime: number;
	endTime: number;
	filesCleanedUp: number;
	timeToEncode: number;
	timeToCleanUp: number;
	timeToRenderChunks: number;
	retriesInfo: ChunkRetry[];
	mostExpensiveFrameRanges: ExpensiveChunk[] | undefined;
	estimatedBillingDurationInMilliseconds: number;
	deleteAfter: DeleteAfter | null;
	timeToCombine: number | null;
	artifactProgress: ReceivedArtifact[];
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

type EncodingProgress = {
	framesEncoded: number;
	combinedFrames: number;
	timeToCombine: number | null;
};

export type GenericRenderProgress<Region extends string> = {
	chunks: number;
	done: boolean;
	encodingStatus: EncodingProgress | null;
	costs: CostsInfo;
	renderId: string;
	renderMetadata: RenderMetadata<Region> | null;
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
	timeToRenderFrames: number | null;
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
	timeoutTimestamp: number;
	functionLaunched: number;
	serveUrlOpened: number | null;
	compositionValidated: number | null;
	artifacts: ReceivedArtifact[];
};

export type RenderProgress = GenericRenderProgress<AwsRegion>;

export const LAMBDA_CONCURRENCY_LIMIT_QUOTA = 'L-B99A9384';
