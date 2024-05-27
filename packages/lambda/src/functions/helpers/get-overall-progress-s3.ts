import {overallProgressKey} from '../../defaults';
import {streamToString} from '../../shared/stream-to-string';
import {getCurrentRegionInFunction} from './get-current-region';
import {lambdaReadFile} from './io';
import type {OverallRenderProgress} from './overall-render-progress';

export const getOverallProgressS3 = async ({
	renderId,
	bucketName,
	expectedBucketOwner,
}: {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
}) => {
	try {
		const Body = await lambdaReadFile({
			bucketName,
			key: overallProgressKey(renderId),
			expectedBucketOwner,
			region: getCurrentRegionInFunction(),
		});

		const str = await streamToString(Body);
		return JSON.parse(str) as OverallRenderProgress;
	} catch (err) {
		if ((err as Error).name === 'NotFound') {
			throw new TypeError(
				`No render with ID "${renderId}" found in bucket ${bucketName} and region ${getCurrentRegionInFunction()}`,
			);
		}

		throw err;
	}
};
