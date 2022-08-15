import {getAccountId} from '../../shared/__mocks__/get-account-id';
import type {enableS3Website as original} from '../enable-s3-website';
import {bucketExistsInRegion} from './bucket-exists';

export const enableS3Website: typeof original = async ({
	region,
	bucketName,
}) => {
	if (
		!bucketExistsInRegion({
			bucketName,
			region,
			expectedBucketOwner: await getAccountId({
				region,
			}),
		})
	)
		return Promise.resolve();
};
