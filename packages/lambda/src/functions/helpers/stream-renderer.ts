import {writeFileSync} from 'fs';
import {join} from 'path';
import type {LambdaPayload} from '../../defaults';
import {LambdaRoutines, chunkKeyForIndex} from '../../defaults';
import {callLambdaWithStreaming} from '../../shared/call-lambda';
import type {OnMessage} from '../streaming/streaming';
import {getCurrentRegionInFunction} from './get-current-region';
import type {OverallProgressHelper} from './overall-render-progress';

export const streamRenderer = async ({
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
			// TODO: Re-call the function
			overallProgress.setFrames({
				encoded: 0,
				index: payload.chunk,
				rendered: 0,
			});

			// TODO: Not catching the error
			streamRenderer({
				payload,
				functionName,
				outdir,
				overallProgress,
				files,
			});
		}

		throw new Error(`Unknown message type ${message.type}`);
	};

	await callLambdaWithStreaming({
		functionName,
		payload,
		// TODO: Should we re-add retries
		retriesRemaining: 0,
		region: getCurrentRegionInFunction(),
		timeoutInTest: 12000,
		type: LambdaRoutines.renderer,
		receivedStreamingPayload,
	});
};
