import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import {overallProgressKey, streamToString} from '@remotion/serverless/client';
import type {OverallRenderProgress} from './overall-render-progress';

export const getOverallProgressS3 = async <Provider extends CloudProvider>({
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
