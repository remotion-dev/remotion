import type {ExpensiveChunk} from './most-expensive-chunks';
import type {RenderMetadata} from './render-metadata';
import type {
	ChunkRetry,
	CloudProvider,
	CostsInfo,
	ReceivedArtifact,
} from './types';
import type {EnhancedErrorInfo} from './write-error-to-storage';

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

export type GenericRenderProgress<Provider extends CloudProvider> = {
	chunks: number;
	done: boolean;
	encodingStatus: EncodingProgress | null;
	costs: CostsInfo;
	renderId: string;
	renderMetadata: RenderMetadata<Provider> | null;
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
	artifacts: ReceivedArtifact<Provider>[];
};
