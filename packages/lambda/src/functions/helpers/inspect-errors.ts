import type {_Object} from '@aws-sdk/client-s3';
import {Internals} from 'remotion';
import type {AwsRegion} from '../../pricing/aws-regions';
import {getErrorKeyPrefix} from '../../shared/constants';
import {DOCS_URL} from '../../shared/docs-url';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';
import {
	errorIsOutOfSpaceError,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
} from './is-enosp-err';
import type {EnhancedErrorInfo, LambdaErrorInfo} from './write-lambda-error';

const FAILED_TO_LAUNCH_TOKEN = 'Failed to launch browser.';

const getExplanation = (stack: string) => {
	if (stack.includes('FATAL:zygote_communication_linux.cc')) {
		return (
			FAILED_TO_LAUNCH_TOKEN +
			' Will be retried - you can probably ignore this error.'
		);
	}

	if (stack.includes('error while loading shared libraries: libnss3.so')) {
		return (
			FAILED_TO_LAUNCH_TOKEN +
			' Will be retried - you can probably ignore this error.'
		);
	}

	if (stack.includes('TooManyRequestsException')) {
		return `AWS returned an "TooManyRequestsException" error message which could mean you reached the concurrency limit of AWS Lambda. You can increase the limit - read this troubleshooting page: ${DOCS_URL}/docs/lambda/troubleshooting/rate-limit`;
	}

	if (errorIsOutOfSpaceError(stack)) {
		return `Your lambda function reached the storage limit. Reduce the amount of space needed per lambda function or increase the storage limit: ${DOCS_URL}/docs/lambda/disk-size.`;
	}

	if (isErrInsufficientResourcesErr(stack)) {
		return 'The lambda ran out of memory. Deploy a new function with more memory.';
	}

	if (isBrowserCrashedError(stack)) {
		return 'The browser crashed while rendering the video. Deploy a new function with memory to give the browser more resources.';
	}

	return null;
};

export const inspectErrors = async ({
	contents,
	bucket,
	region,
	renderId,
	expectedBucketOwner,
}: {
	contents: _Object[];
	bucket: string;
	region: AwsRegion;
	renderId: string;
	expectedBucketOwner: string;
}): Promise<EnhancedErrorInfo[]> => {
	const errs = contents
		.filter((c) => c.Key?.startsWith(getErrorKeyPrefix(renderId)))
		.map((c) => c.Key)
		.filter(Internals.truthy);

	if (errs.length === 0) {
		return [];
	}

	const errors = await Promise.all(
		errs.map(async (key) => {
			const Body = await lambdaReadFile({
				bucketName: bucket,
				key,
				region,
				expectedBucketOwner,
			});
			const errorLog = await streamToString(Body);
			return errorLog;
		})
	);
	return errors.map((e, index): EnhancedErrorInfo => {
		const parsed = JSON.parse(e) as LambdaErrorInfo;

		return {
			...parsed,
			explanation: getExplanation(parsed.stack),
			s3Location: errs[index],
		};
	});
};
