import {getErrorKeyPrefix} from '../../shared/constants';
import {randomHash} from '../../shared/random-hash';
import {getCurrentRegion} from './get-current-region';
import {FileNameAndSize, getFolderFiles} from './get-files-in-folder';
import {lambdaWriteFile} from './io';

export type LambdaErrorInfo = {
	type: 'renderer' | 'browser' | 'stitcher';
	stack: string;
	frame: number | null;
	chunk: number | null;
	isFatal: boolean;
	tmpDir: {files: FileNameAndSize[]; total: number} | null;
};

export const getTmpDirStateIfENoSp = (
	err: string
): LambdaErrorInfo['tmpDir'] => {
	if (!err.includes('ENOSP')) {
		return null;
	}

	const files = getFolderFiles('/tmp');
	return {
		files: files
			.slice(0)
			.sort((a, b) => a.size - b.size)
			.reverse()
			.slice(0, 100),
		total: files.reduce((a, b) => a + b.size, 0),
	};
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
