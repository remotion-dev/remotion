import {S3Client} from '@aws-sdk/client-s3';
import {lambdaReadFile} from './io';
import {streamToString} from './stream-to-string';

export const inspectErrors = async ({
	errs,
	s3Client,
	bucket,
}: {
	errs: string[];
	s3Client: S3Client;
	bucket: string;
}) => {
	if (errs.length === 0) {
		return [];
	}

	// TODO: unhardcode
	const stitcherFailures = errs.filter((e) => e.startsWith('error-stitcher'));
	const errors = await Promise.all(
		stitcherFailures.map(async (key) => {
			const Body = await lambdaReadFile({
				bucketName: bucket,
				key,
			});
			const errorLog = await streamToString(Body);
			return errorLog;
		})
	);
	return errors.map((e) => {
		if (e.includes('ENOSPC')) {
			return 'Your lambda function reached the 512MB storage. To render videos this big, you need to enable EFS mode.';
		}

		// TODO: Make typesafe and handle error
		return JSON.parse(e).error;
	});
};
