import {overallProgressKey} from './constants';
import type {OverallRenderProgress} from './overall-render-progress';
import type {ProviderSpecifics} from './provider-implementation';
import {streamToString} from './stream-to-string';
import type {CloudProvider} from './types';

export const getOverallProgressFromStorage = async <
	Provider extends CloudProvider,
>({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	providerSpecifics,
	forcePathStyle,
}: {
	renderId: string;
	expectedBucketOwner: string | null;
	bucketName: string;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
}) => {
	try {
		const Body = await providerSpecifics.readFile({
			bucketName,
			key: overallProgressKey(renderId),
			expectedBucketOwner,
			region,
			forcePathStyle,
		});

		const str = await streamToString(Body);
		return JSON.parse(str) as OverallRenderProgress<Provider>;
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			throw new TypeError(
				`No render with ID "${renderId}" found in bucket ${bucketName} and region ${region}`,
			);
		}

		throw err;
	}
};
