import type {_Object} from '@aws-sdk/client-s3';
import type {EncodingProgress} from '../../defaults';
import {getProgressOfChunk} from '../../shared/chunk-progress';

export const getEncodingMetadata = ({
	exists,
	frameCount,
	stepSize,
}: {
	exists: _Object | undefined;
	frameCount: number;
	stepSize: number;
}): EncodingProgress | null => {
	if (!exists) {
		return null;
	}

	const framesEncoded = getProgressOfChunk(exists.ETag as string);

	// We only report every 100 frames encoded so that we are able to report up to 2000 * 100 ETags => 200000 frames
	return {
		framesEncoded: Math.min(frameCount, framesEncoded * stepSize),
	};
};
