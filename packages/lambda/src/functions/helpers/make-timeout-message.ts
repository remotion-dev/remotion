import type {RenderMetadata} from '../../defaults';
import {LambdaRoutines} from '../../defaults';
import {DOCS_URL} from '../../shared/docs-url';
import {
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
} from '../../shared/get-aws-urls';
import {getCurrentRegionInFunction} from './get-current-region';

const MAX_MISSING_CHUNKS = 5;

const makeChunkMissingMessage = ({
	missingChunks,
	renderMetadata,
}: {
	missingChunks: number[];
	renderMetadata: RenderMetadata;
}) => {
	if (missingChunks.length === 0) {
		return 'All chunks have been successfully rendered, but the main function has timed out.';
	}

	return [
		`The following chunks are missing (showing ${Math.min(
			MAX_MISSING_CHUNKS,
			missingChunks.length,
		)} out of ${missingChunks.length}):`,
		...missingChunks
			.map((ch) => {
				const isLastChunk = ch === renderMetadata.totalChunks - 1;
				const start = ch * renderMetadata.framesPerLambda;
				const end =
					renderMetadata.type === 'still'
						? 0
						: isLastChunk
							? renderMetadata.frameRange[1]
							: (ch + 1) * renderMetadata.framesPerLambda - 1;

				const msg = `Chunk ${ch} (Frames ${start} - ${end})`;

				return [
					msg,
					`▸ Logs for chunk ${ch}: ${getCloudwatchRendererUrl({
						functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
						region: getCurrentRegionInFunction(),
						rendererFunctionName: null,
						renderId: renderMetadata.renderId,
						chunk: ch,
					})}`,
				].join('\n');
			})
			.slice(0, 5),
	].join('\n');
};

export const makeTimeoutMessage = ({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
	renderId,
}: {
	timeoutInMilliseconds: number;
	missingChunks: number[];
	renderMetadata: RenderMetadata;
	renderId: string;
}) => {
	const cloudWatchRendererUrl = getCloudwatchRendererUrl({
		renderId,
		functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
		region: getCurrentRegionInFunction(),
		rendererFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
		chunk: null,
	});

	const cloudWatchLaunchUrl = getCloudwatchMethodUrl({
		renderId,
		functionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
		method: LambdaRoutines.launch,
		region: getCurrentRegionInFunction(),
		rendererFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME as string,
	});

	const message = [
		`The main function timed out after ${timeoutInMilliseconds}ms.`,
		makeChunkMissingMessage({missingChunks, renderMetadata}),
		'',
		`Consider increasing the timeout of your function.`,
		`▸ You can use the "--timeout" parameter when deploying a function via CLI, or the "timeoutInSeconds" parameter when using the deployFunction() API.`,
		`${DOCS_URL}/docs/lambda/cli/functions#deploy`,
		'',
		'▸ Visit the logs for the main function:',
		cloudWatchLaunchUrl,
		'▸ Visit the logs for the renderer functions:',
		cloudWatchRendererUrl,
		'',
		'▸ Get help on debugging this error:',
		`${DOCS_URL}/docs/lambda/troubleshooting/debug`,
	].join('\n');

	return message;
};
