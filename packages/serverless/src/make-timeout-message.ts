import {ServerlessRoutines} from './constants';
import {DOCS_URL} from './docs-url';
import type {ProviderSpecifics} from './provider-implementation';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';

const MAX_MISSING_CHUNKS = 5;

const makeChunkMissingMessage = <Provider extends CloudProvider>({
	missingChunks,
	renderMetadata,
	region,
	providerSpecifics,
	functionName,
}: {
	missingChunks: number[];
	renderMetadata: RenderMetadata<Provider>;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	functionName: string;
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
					`▸ Logs for chunk ${ch}: ${providerSpecifics.getLoggingUrlForRendererFunction(
						{
							functionName,
							region,
							rendererFunctionName: null,
							renderId: renderMetadata.renderId,
							chunk: ch,
						},
					)}`,
				].join('\n');
			})
			.slice(0, 5),
	].join('\n');
};

export const makeTimeoutMessage = <Provider extends CloudProvider>({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
	renderId,
	functionName,
	region,
	providerSpecifics,
}: {
	timeoutInMilliseconds: number;
	missingChunks: number[];
	renderMetadata: RenderMetadata<Provider>;
	renderId: string;
	region: Provider['region'];
	functionName: string;
	providerSpecifics: ProviderSpecifics<Provider>;
}) => {
	const cloudWatchRendererUrl =
		providerSpecifics.getLoggingUrlForRendererFunction({
			renderId,
			functionName,
			region,
			rendererFunctionName: functionName,
			chunk: null,
		});

	const cloudWatchLaunchUrl = providerSpecifics.getLoggingUrlForMethod({
		renderId,
		functionName,
		method: ServerlessRoutines.launch,
		region,
		rendererFunctionName: functionName,
	});
	const message = [
		`The main function timed out after ${timeoutInMilliseconds}ms.`,
		makeChunkMissingMessage({
			missingChunks,
			renderMetadata,
			region,
			providerSpecifics,
			functionName,
		}),
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
