import type {EncodingProgress} from '../../defaults';
import {encodingProgressKey} from '../../defaults';
import type {AwsRegion} from '../../pricing/aws-regions';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getEncodingMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	try {
		const Body = await lambdaReadFile({
			bucketName,
			key: encodingProgressKey(renderId),
			region,
			expectedBucketOwner,
		});
		const encodingProgress = JSON.parse(
			await streamToString(Body)
		) as EncodingProgress;

		return encodingProgress;
	} catch (err) {
		// The file may not yet have been fully written or already have been cleaned up again
		return null;
	}
};
