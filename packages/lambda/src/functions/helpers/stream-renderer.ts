import {writeFileSync} from 'fs';
import {join} from 'path';
import type {LambdaPayload} from '../../defaults';
import {LambdaRoutines, chunkKeyForIndex} from '../../defaults';
import {callLambdaWithStreaming} from '../../shared/call-lambda';
import type {OnMessage} from '../streaming/streaming';
import {getCurrentRegionInFunction} from './get-current-region';
import type {OverallProgressHelper} from './overall-render-progress';

type StreamRendererResponse =
	| {
			type: 'success';
	  }
	| {
			type: 'error';
			error: string;
			shouldRetry: boolean;
	  };

const streamRenderer = ({
	payload,
	functionName,
	outdir,
	overallProgress,
	files,
}: {
	payload: LambdaPayload;
	functionName: string;
	outdir: string;
	overallProgress: OverallProgressHelper;
	files: string[];
}) => {
	if (payload.type !== LambdaRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	return new Promise<StreamRendererResponse>((resolve) => {
		const receivedStreamingPayload: OnMessage = ({message}) => {
			if (message.type === 'frames-rendered') {
				overallProgress.setFrames({
					index: payload.chunk,
					encoded: message.payload.encoded,
					rendered: message.payload.rendered,
				});
				return;
			}

			if (message.type === 'video-chunk-rendered') {
				const filename = join(
					outdir,
					chunkKeyForIndex({
						index: payload.chunk,
						type: 'video',
					}),
				);
				writeFileSync(filename, message.payload);
				files.push(filename);
				return;
			}

			if (message.type === 'audio-chunk-rendered') {
				const filename = join(
					outdir,
					chunkKeyForIndex({
						index: payload.chunk,
						type: 'audio',
					}),
				);
				writeFileSync(filename, message.payload);
				files.push(filename);
				return;
			}

			if (message.type === 'chunk-complete') {
				overallProgress.addChunkCompleted(payload.chunk);
				return;
			}

			if (message.type === 'error-occurred') {
				overallProgress.setFrames({
					encoded: 0,
					index: payload.chunk,
					rendered: 0,
				});

				resolve({
					type: 'error',
					error: message.payload.error,
					shouldRetry: message.payload.shouldRetry,
				});
			}

			throw new Error(`Unknown message type ${message.type}`);
		};

		callLambdaWithStreaming({
			functionName,
			payload,
			retriesRemaining: 1,
			region: getCurrentRegionInFunction(),
			timeoutInTest: 12000,
			type: LambdaRoutines.renderer,
			receivedStreamingPayload,
		})
			.then(() => {
				resolve({
					type: 'success',
				});
			})
			.catch((err) => {
				resolve({
					type: 'error',
					error: (err as Error).stack as string,
					shouldRetry: false,
				});
			});
	});
};

export const streamRendererFunctionWithRetry = async ({
	payload,
	files,
	functionName,
	outdir,
	overallProgress,
}: {
	payload: LambdaPayload;
	functionName: string;
	outdir: string;
	overallProgress: OverallProgressHelper;
	files: string[];
}): Promise<unknown> => {
	if (payload.type !== LambdaRoutines.renderer) {
		throw new Error('Expected renderer type');
	}

	const result = await streamRenderer({
		files,
		functionName,
		outdir,
		overallProgress,
		payload,
	});

	if (result.type === 'error') {
		if (!result.shouldRetry) {
			throw result.error;
		}

		return streamRendererFunctionWithRetry({
			files,
			functionName,
			outdir,
			overallProgress,
			payload: {
				...payload,
				attempt: payload.attempt + 1,
				retriesLeft: payload.retriesLeft - 1,
			},
		});
	}
};
