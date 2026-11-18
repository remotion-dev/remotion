import {
	MAX_FUNCTIONS_PER_RENDER,
	MINIMUM_FRAMES_PER_FUNCTION,
} from './shared-constants';

export const validateChunks = ({
	chunks,
	frameRange,
	everyNthFrame,
	framesPerFunction,
	concurrency,
}: {
	chunks: unknown;
	frameRange: [number, number];
	everyNthFrame: number;
	framesPerFunction: number | null;
	concurrency: number | null;
}): [number, number][] => {
	if (framesPerFunction !== null) {
		throw new TypeError(
			`Both 'chunks' and 'framesPerLambda' were set. Please use only one of them.`,
		);
	}

	if (concurrency !== null) {
		throw new TypeError(
			`Both 'chunks' and 'concurrency' were set. Please use only one of them.`,
		);
	}

	if (everyNthFrame !== 1) {
		throw new TypeError(
			`'chunks' cannot be combined with 'everyNthFrame', passed everyNthFrame = ${everyNthFrame}`,
		);
	}

	if (!Array.isArray(chunks) || chunks.length === 0) {
		throw new TypeError(
			`'chunks' needs to be a non-empty array of [startFrame, endFrame] pairs, passed ${JSON.stringify(chunks)}`,
		);
	}

	if (chunks.length > MAX_FUNCTIONS_PER_RENDER) {
		throw new TypeError(
			`'chunks' cannot have more than ${MAX_FUNCTIONS_PER_RENDER} entries, passed ${chunks.length}`,
		);
	}

	const [firstFrame, lastFrame] = frameRange;
	const minimumFrames = Math.min(
		MINIMUM_FRAMES_PER_FUNCTION,
		lastFrame - firstFrame + 1,
	);

	let expectedStart = firstFrame;
	for (const [index, chunk] of chunks.entries()) {
		if (
			!Array.isArray(chunk) ||
			chunk.length !== 2 ||
			!Number.isInteger(chunk[0]) ||
			!Number.isInteger(chunk[1])
		) {
			throw new TypeError(
				`'chunks[${index}]' needs to be a pair of integers [startFrame, endFrame], passed ${JSON.stringify(chunk)}`,
			);
		}

		const [start, end] = chunk;
		if (start !== expectedStart) {
			throw new TypeError(
				index === 0
					? `'chunks[0]' needs to start at the first frame of the frame range (${firstFrame}), but starts at ${start}`
					: `'chunks[${index}]' needs to start at ${expectedStart}, right after 'chunks[${index - 1}]', but starts at ${start}. Chunks need to be sorted, contiguous and non-overlapping.`,
			);
		}

		if (end < start) {
			throw new TypeError(
				`'chunks[${index}]' needs to end at or after its start, passed [${start}, ${end}]`,
			);
		}

		if (end - start + 1 < minimumFrames) {
			throw new TypeError(
				`'chunks[${index}]' needs to have at least ${minimumFrames} frames, but [${start}, ${end}] has ${end - start + 1}`,
			);
		}

		expectedStart = end + 1;
	}

	if (expectedStart !== lastFrame + 1) {
		throw new TypeError(
			`The last entry of 'chunks' needs to end at the last frame of the frame range (${lastFrame}), but ends at ${expectedStart - 1}`,
		);
	}

	return chunks;
};
