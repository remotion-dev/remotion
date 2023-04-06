import type {RenderMetadata} from '../../defaults';
import {DOCS_URL} from '../../shared/docs-url';

const makeChunkMissingMessage = ({
	missingChunks,
	renderMetadata,
}: {
	missingChunks: number[];
	renderMetadata: RenderMetadata;
}) => {
	const missingChunksMessageList = missingChunks
		.map((ch) => {
			const isLastChunk = ch === renderMetadata.totalChunks - 1;
			const start = ch * renderMetadata.framesPerLambda;
			const end = isLastChunk
				? renderMetadata.frameRange[1]
				: (ch + 1) * renderMetadata.framesPerLambda - 1;

			return `Chunk ${ch} (Frames ${start} - ${end})`;
		})
		.slice(0, 5);

	if (missingChunksMessageList.length === 0) {
		return 'All chunks have been successfully rendered, but the main function has timed out.';
	}

	return `The following chunks are missing (showing ${
		missingChunksMessageList.length
	} out of ${missingChunks.length}): ${missingChunksMessageList.join(', ')}.`;
};

export const makeTimeoutMessage = ({
	timeoutInMilliseconds,
	missingChunks,
	renderMetadata,
}: {
	timeoutInMilliseconds: number;
	missingChunks: number[];
	renderMetadata: RenderMetadata;
}) => {
	const message = [
		`The main function timed out after ${timeoutInMilliseconds}ms.`,
		`Consider increasing the timeout of your function.`,
		makeChunkMissingMessage({missingChunks, renderMetadata}),
		`You can use the "--timeout" parameter when deploying a function via CLI, or the "timeoutInSeconds" parameter when using the deployFunction() API.`,
		`${DOCS_URL}/docs/lambda/cli/functions#deploy`,
	].join('\n');

	return message;
};
