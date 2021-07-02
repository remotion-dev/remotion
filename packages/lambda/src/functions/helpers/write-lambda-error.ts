import {getErrorKeyPrefix} from '../../shared/constants';
import {randomHash} from '../../shared/random-hash';
import {getCurrentRegion} from './get-current-region';
import {lambdaWriteFile} from './io';

export type LambdaErrorInfo = {
	type: 'renderer' | 'browser' | 'stitcher';
	stack: string;
	frame: number | null;
	chunk: number | null;
	isFatal: boolean;
};

export type EnhancedErrorInfo = LambdaErrorInfo & {
	s3Location: string;
	explanation: string | null;
};

export const writeLambdaError = async ({
	bucketName,
	renderId,
	errorInfo,
	expectedBucketOwner,
}: {
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
	errorInfo: LambdaErrorInfo;
}) => {
	await lambdaWriteFile({
		bucketName,
		key: `${getErrorKeyPrefix(renderId)}${randomHash()}.txt`,
		body: JSON.stringify(errorInfo),
		region: getCurrentRegion(),
		acl: 'private',
		expectedBucketOwner,
	});
};
