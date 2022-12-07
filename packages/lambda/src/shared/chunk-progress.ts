// Idea behind getting fine-grained chunk progress:
// Keep a file called "lambda-initialized-chunk:1-attempt:1" in the S3 bucket.

// In that file, we write the number of rendered frames. That file will then get an ETag,
// and we can keep a map of ETags ot figure out what's inside the file without having to read it.

import {getCurrentRegionInFunction} from '../functions/helpers/get-current-region';
import {lambdaWriteFile} from '../functions/helpers/io';
import {lambdaChunkInitializedKey} from './constants';

export const writeLambdaInitializedFile = ({
	bucketName,
	expectedBucketOwner,
	attempt,
	chunk,
	renderId,
	framesRendered,
}: {
	bucketName: string;
	expectedBucketOwner: string;
	renderId: string;
	chunk: number;
	attempt: number;
	framesRendered: number;
}) => {
	return lambdaWriteFile({
		privacy: 'private',
		bucketName,
		body: String(framesRendered),
		key: lambdaChunkInitializedKey({
			renderId,
			chunk,
			attempt,
		}),
		region: getCurrentRegionInFunction(),
		expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});
};
