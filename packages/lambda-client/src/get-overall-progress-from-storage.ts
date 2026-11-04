import type {OverallRenderProgress} from './overall-render-progress';
import {lambdaReadFileImplementation} from './read-file';
import type {AwsRegion} from './regions';
import {overallProgressKey} from './shared-constants';
import {streamToString} from './stream-to-string';
import type {RequestHandler} from './types';

type GetOverallProgressFromStorageInput = {
	renderId: string;
	expectedBucketOwner: string | null;
	bucketName: string;
	region: AwsRegion;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export const getOverallProgressFromStorage = async ({
	renderId,
	bucketName,
	expectedBucketOwner,
	region,
	forcePathStyle,
	requestHandler,
}: GetOverallProgressFromStorageInput) => {
	try {
		const Body = await lambdaReadFileImplementation({
			bucketName,
			key: overallProgressKey(renderId),
			expectedBucketOwner,
			region,
			forcePathStyle,
			requestHandler,
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
