import {DOCS_URL} from './docs-url';
import {
	errorIsOutOfSpaceError,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
} from './error-category';
import type {
	EnhancedErrorInfo,
	FunctionErrorInfo,
} from './write-error-to-storage';

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

export const inspectErrors = ({
	errors,
}: {
	errors: FunctionErrorInfo[];
}): EnhancedErrorInfo[] => {
	return errors.map((e): EnhancedErrorInfo => {
		return {
			...e,
			explanation: getExplanation(e.stack),
			s3Location: '',
		};
	});
};
