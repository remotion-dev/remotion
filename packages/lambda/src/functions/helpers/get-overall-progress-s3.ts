import type {ProviderSpecifics} from '@remotion/serverless';
import {overallProgressKey, streamToString} from '@remotion/serverless/client';
import type {OverallRenderProgress} from './overall-render-progress';

export const getOverallProgressS3 = async <Region extends string>({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	providerSpecifics,
}: {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
	region: Region;
	providerSpecifics: ProviderSpecifics<Region>;
}) => {
	try {
		const Body = await providerSpecifics.readFile({
			bucketName,
			key: overallProgressKey(renderId),
			expectedBucketOwner,
			region,
		});

		const str = await streamToString(Body);
		return JSON.parse(str) as OverallRenderProgress<Region>;
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			throw new TypeError(
				`No render with ID "${renderId}" found in bucket ${bucketName} and region ${region}`,
			);
		}

		throw err;
	}
};
