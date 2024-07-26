import {Readable} from 'stream';

import type {
	lambdaDeleteFile as deleteOriginal,
	lambdaHeadCommand as headOriginal,
	lambdaReadFile as readOriginal,
	lambdaWriteFile as writeOriginal,
} from '../../../functions/helpers/io';
import {
	mockDeleteS3File,
	readMockS3File,
	writeMockS3File,
} from '../../../test/mocks/mock-store';

export const lambdaReadFile: typeof readOriginal = ({
	bucketName,
	key,
	region,
}) => {
	const file = readMockS3File({region, key, bucketName});
	if (!file) {
		throw new Error(`no file ${key}`);
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
		body: body as string,
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
	if (!read) {
		const err = new Error('File not found');
		err.name = 'NotFound';
		throw err;
	}

	return Promise.resolve({
		ContentLength: read.content.toString().length,
		LastModified: new Date(),
	});
};
