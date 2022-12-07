import type {_Object} from '@aws-sdk/client-s3';
import {getProgressOfChunk} from '../../shared/chunk-progress';
import {chunkKey} from '../../shared/constants';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';
import {parseLambdaInitializedKey} from '../../shared/parse-lambda-initialized-key';

export const getRenderedFramesProgress = ({
	contents,
	renderId,
	framesPerLambda,
}: {
	contents: _Object[];
	renderId: string;
	framesPerLambda: number;
}) => {
	const chunkProgress: Record<number, number> = {};

	// Sort, so only the latest attempt is used
	const sortedChunks = contents.sort((a, b) => {
		return (a.Key as string).localeCompare(b.Key as string);
	});

	for (const chunk of sortedChunks) {
		const key = parseLambdaInitializedKey(chunk.Key as string);
		chunkProgress[key.chunk] = getProgressOfChunk(chunk.ETag as string);
	}

	for (const chunk of contents.filter((c) =>
		c.Key?.startsWith(chunkKey(renderId))
	)) {
		const parsed = parseLambdaChunkKey(chunk.Key as string);
		// TODO: What if it was the last chunk?
		chunkProgress[parsed.chunk] = framesPerLambda;
	}

	const framesRendered = Object.values(chunkProgress).reduce(
		(a, b) => a + b,
		0
	);

	return framesRendered;
};
