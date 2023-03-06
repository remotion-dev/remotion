import type {_Object} from '@aws-sdk/client-s3';
import type {RenderMetadata} from '../../defaults';
import {DOCS_URL} from '../../shared/docs-url';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';
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

	const missingChunksMessageList = missingChunks
		.map((ch) => {
			const isLastChunk = ch === renderMetadata.totalChunks - 1;
			const start = ch * renderMetadata.framesPerLambda;
			const end = isLastChunk
				? renderMetadata.frameRange[1]
				: (ch + 1) * renderMetadata.framesPerLambda - 1;

			return `Chunk ${ch} (Frames ${start} - ${end})`;
		})
		.slice(0, 5)
		.join(', ');

	const message = [
		`The main function timed out after ${timeoutInMilliseconds}ms.`,
		`Consider increasing the timeout of your function.`,
		`The following chunks are missing (showing up to 5): ${missingChunksMessageList}.`,
		`You can use the "--timeout" parameter when deploying a function via CLI, or the "timeoutInSeconds" parameter when using the deployFunction() API.`,
		`${DOCS_URL}/docs/lambda/cli/functions#deploy`,
	].join('\n');

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
