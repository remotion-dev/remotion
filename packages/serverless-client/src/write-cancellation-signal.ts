import {cancellationKey} from './constants';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';

export const writeCancellationSignal = async <Provider extends CloudProvider>({
	bucketName,
	renderId,
	region,
	expectedBucketOwner,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
}: {
	bucketName: string;
	renderId: string;
	region: Provider['region'];
	expectedBucketOwner: string;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => {
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
