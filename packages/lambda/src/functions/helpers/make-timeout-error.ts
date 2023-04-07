import type {_Object} from '@aws-sdk/client-s3';
import type {RenderMetadata} from '../../defaults';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';
import {makeTimeoutMessage} from './make-timeout-message';
import type {EnhancedErrorInfo} from './write-lambda-error';

export const makeTimeoutError = ({
	timeoutInMilliseconds,
	chunks,
	renderMetadata,
}: {
	timeoutInMilliseconds: number;
	chunks: _Object[];
	renderMetadata: RenderMetadata;
}): EnhancedErrorInfo => {
	const availableChunks = chunks.map((c) =>
		parseLambdaChunkKey(c.Key as string)
	);

	const missingChunks = new Array(renderMetadata.totalChunks)
		.fill(true)
		.filter((_, i) => {
			return !availableChunks.find((c) => c.chunk === i);
		})
		.map((_, i) => i);

	const message = makeTimeoutMessage({
		missingChunks,
		renderMetadata,
		timeoutInMilliseconds,
	});

	return {
		attempt: 1,
		chunk: null,
		explanation: message,
		frame: null,
		isFatal: true,
		s3Location: '',
		stack: new Error().stack as string,
		tmpDir: null,
		totalAttempts: 1,
		type: 'stitcher',
		willRetry: false,
		message,
		name: 'TimeoutError',
	};
};
