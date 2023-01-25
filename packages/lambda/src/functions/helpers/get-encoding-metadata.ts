import type {_Object} from '@aws-sdk/client-s3';
import type {EncodingProgress} from '../../defaults';
import {getProgressOfChunk} from '../../shared/chunk-progress';

export const getEncodingMetadata = ({
	exists,
}: {
	exists: _Object | undefined;
}): EncodingProgress | null => {
	if (!exists) {
		return null;
	}

	const framesEncoded = getProgressOfChunk(exists.ETag as string);

	return {framesEncoded};
};
