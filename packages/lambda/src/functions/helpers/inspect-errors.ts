import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const inspectErrors = async ({
	errs,
	bucket,
}: {
	errs: string[];
	bucket: string;
}) => {
	if (errs.length === 0) {
		return [];
	}

	const errors = await Promise.all(
		errs.map(async (key) => {
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

		if (e.includes('FATAL:zygote_communication_linux.cc')) {
			return 'Failed to launch browser';
		}

		// TODO: Make typesafe and handle error
		return JSON.parse(e).error;
	});
};
