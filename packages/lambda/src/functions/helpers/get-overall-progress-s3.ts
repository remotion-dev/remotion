import type {AwsRegion} from '../../client';
import {overallProgressKey} from '../../shared/constants';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';
import type {OverallRenderProgress} from './overall-render-progress';

export const getOverallProgressS3 = async ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
}: {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
	region: AwsRegion;
}) => {
	try {
		const Body = await lambdaReadFile({
			bucketName,
			key: overallProgressKey(renderId),
			expectedBucketOwner,
			region,
		});

		const str = await streamToString(Body);
		return JSON.parse(str) as OverallRenderProgress;
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			throw new TypeError(
				`No render with ID "${renderId}" found in bucket ${bucketName} and region ${region}`,
			);
		}

		throw err;
	}
};
