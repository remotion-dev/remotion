import type {RenderMetadata} from './render-metadata';
import type {PostRenderData, SeparateAudioOutput} from './shared-constants';
import type {ChunkRetry, ParsedTiming, ReceivedArtifact} from './types';
import type {FunctionErrorInfo} from './write-error-to-storage';

export type OverallRenderProgress = {
	/**
	 * Whether renderers poll for a cancellation signal.
	 */
	cancellationEnabled: boolean | null;
	chunks: number[];
	framesRendered: number;
	framesEncoded: number;
	framesUploaded: number;
	uploadedSizeInBytes: number;
	combinedFrames: number;
	timeToCombine: number | null;
	timeToEncode: number | null;
	timeToRenderFrames: number | null;
	lambdasInvoked: number;
	retries: ChunkRetry[];
	postRenderData: PostRenderData | null;
	separateAudio: SeparateAudioOutput | null;
	timings: ParsedTiming[];
	renderMetadata: RenderMetadata | null;
	errors: FunctionErrorInfo[];
	fatalErrorTimestamp: number | null;
	timeoutTimestamp: number;
	functionLaunched: number;
	serveUrlOpened: number | null;
	compositionValidated: number | null;
	receivedArtifact: ReceivedArtifact[];
};
