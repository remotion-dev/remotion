import type {ProviderSpecifics} from './provider-implementation';
import type {AwsRegion} from './regions';
import {cancellationKey} from './shared-constants';
import type {RequestHandler} from './types';

type WriteCancellationSignalInput = {
	bucketName: string;
	renderId: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	providerSpecifics: ProviderSpecifics;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export const writeCancellationSignal = async ({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
}: WriteCancellationSignalInput) => {
	await providerSpecifics.writeFile({
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
