import type {
	lambdaHeadCommand as headOriginal,
	lambdaWriteFile as writeOriginal,
} from '../../../functions/helpers/io';
import {readMockS3File, writeMockS3File} from '../../../test/mocks/mock-store';

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
