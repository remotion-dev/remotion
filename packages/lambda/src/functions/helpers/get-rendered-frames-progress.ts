import type {_Object} from '@aws-sdk/client-s3';
import {getProgressOfChunk} from '../../shared/chunk-progress';
import {chunkKey, lambdaChunkInitializedPrefix} from '../../shared/constants';
import {parseLambdaChunkKey} from '../../shared/parse-chunk-key';
import {parseLambdaInitializedKey} from '../../shared/parse-lambda-initialized-key';
import {planFrameRanges} from '../chunk-optimization/plan-frame-ranges';

export const getRenderedFramesProgress = ({
	contents,
	renderId,
	framesPerLambda,
	everyNthFrame,
	frameRange,
}: {
	contents: _Object[];
	renderId: string;
	framesPerLambda: number;
	frameRange: [number, number];
	everyNthFrame: number;
}) => {
	const chunkProgress: Record<number, number> = {};

	const {chunks} = planFrameRanges({
		everyNthFrame,
		frameRange,
		framesPerLambda,
	});

	// Sort, so only the latest attempt is used
	const sortedChunks = contents
		.filter((c) => {
			return (c.Key as string).startsWith(
				lambdaChunkInitializedPrefix(renderId)
			);
		})
		.sort((a, b) => {
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
		const frameRangeInChunk = chunks[parsed.chunk];
		chunkProgress[parsed.chunk] =
			frameRangeInChunk[1] - frameRangeInChunk[0] + 1;
	}

	const framesRendered = Object.values(chunkProgress).reduce(
		(a, b) => a + b,
		0
	);

	return framesRendered;
};
