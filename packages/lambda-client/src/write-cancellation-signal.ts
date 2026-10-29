import type {AwsRegion} from './regions';
import {cancellationKey} from './shared-constants';
import type {RequestHandler} from './types';
import {lambdaWriteFileImplementation} from './write-file';

type WriteCancellationSignalInput = {
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export const writeCancellationSignal = async ({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
	forcePathStyle,
	requestHandler,
}: WriteCancellationSignalInput) => {
	await lambdaWriteFileImplementation({
		bucketName,
		key: cancellationKey(renderId),
		body: JSON.stringify({cancelledAt: Date.now()}),
		region,
		privacy: 'private',
		expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
		forcePathStyle,
		storageClass: null,
		requestHandler,
	});
};
