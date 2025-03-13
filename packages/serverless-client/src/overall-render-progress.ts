import type {PostRenderData} from './constants';
import type {RenderMetadata} from './render-metadata';
import type {
	ChunkRetry,
	CloudProvider,
	ParsedTiming,
	ReceivedArtifact,
} from './types';
import type {FunctionErrorInfo} from './write-error-to-storage';

export type OverallRenderProgress<Provider extends CloudProvider> = {
	chunks: number[];
	framesRendered: number;
	framesEncoded: number;
	combinedFrames: number;
	timeToCombine: number | null;
	timeToEncode: number | null;
	timeToRenderFrames: number | null;
	lambdasInvoked: number;
	retries: ChunkRetry[];
	postRenderData: PostRenderData<Provider> | null;
	timings: ParsedTiming[];
	renderMetadata: RenderMetadata<Provider> | null;
	errors: FunctionErrorInfo[];
	timeoutTimestamp: number;
	functionLaunched: number;
	serveUrlOpened: number | null;
	compositionValidated: number | null;
	receivedArtifact: ReceivedArtifact<Provider>[];
};
