import type {_Object} from '@aws-sdk/client-s3';
import {Readable} from 'stream';
import {
	getS3FilesInBucket,
	mockDeleteS3File,
	readMockS3File,
	writeMockS3File,
} from '../../../api/__mocks__/mock-s3';
import type {
	lambdaDeleteFile as deleteOriginal,
	lambdaHeadCommand as headOriginal,
	lambdaLs as lsOriginal,
	lambdaReadFile as readOriginal,
	lambdaWriteFile as writeOriginal,
} from '../../../functions/helpers/io';
import type {LambdaLSInput, LambdaLsReturnType} from '../io';

export const lambdaReadFile: typeof readOriginal = ({
	bucketName,
	key,
	region,
}) => {
	const file = readMockS3File({region, key, bucketName});
	if (!file) {
		throw new Error('no file');
	}

	if (typeof file.content === 'string') {
		return Promise.resolve(Readable.from(Buffer.from(file.content)));
	}

	return Promise.resolve(file.content);
};

export const lambdaWriteFile: typeof writeOriginal = ({
	body,
	bucketName,
	key,
	privacy,
	region,
}) => {
	writeMockS3File({
		body,
		bucketName,
		key,
		privacy,
		region,
	});
	return Promise.resolve(undefined);
};

export const lambdaDeleteFile: typeof deleteOriginal = ({
	bucketName,
	key,
	region,
}) => {
	mockDeleteS3File({
		bucketName,
		key,
		region,
	});
	return Promise.resolve(undefined);
};

export const lambdaHeadCommand: typeof headOriginal = ({
	bucketName,
	key,
	region,
}) => {
	const read = readMockS3File({
		bucketName,
		key,
		region,
	});
	return Promise.resolve({
		ContentLength: read?.content.toString().length,
		LastModified: new Date(),
	});
};

export const lambdaLs: typeof lsOriginal = (
	input: LambdaLSInput
): LambdaLsReturnType => {
	if (!input) {
		throw new Error('need to pass input');
	}

	const files = getS3FilesInBucket({
		bucketName: input.bucketName,
		region: input.region,
	});

	return Promise.resolve(
		files
			.filter((p) => p.key.startsWith(input.prefix))
			.map((file): _Object => {
				const size = typeof file.content === 'string' ? file.content.length : 0;
				return {
					Key: file.key,
					ETag: undefined,
					LastModified: new Date(0),
					Owner: undefined,
					Size: size,
					StorageClass: undefined,
				};
			})
	);
};
