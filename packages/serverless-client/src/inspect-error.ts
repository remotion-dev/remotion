import {
	errorIsOutOfSpaceError,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
} from './error-category';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';
import type {
	EnhancedErrorInfo,
	FunctionErrorInfo,
} from './write-error-to-storage';

const FAILED_TO_LAUNCH_TOKEN = 'Failed to launch browser.';

const getExplanation = <Provider extends CloudProvider>(
	stack: string,
	providerSpecifics: ProviderSpecifics<Provider>,
) => {
	const providerExplanation = providerSpecifics.getErrorExplanation(stack);
	if (providerExplanation !== null) {
		return providerExplanation;
	}

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

	if (errorIsOutOfSpaceError(stack)) {
		return `Your function reached the storage limit. Reduce the amount of space needed per function or increase the storage limit: ${providerSpecifics.getDocsUrl('disk-size')}.`;
	}

	if (isErrInsufficientResourcesErr(stack)) {
		return 'The function ran out of memory. Deploy a new function with more memory.';
	}

	if (isBrowserCrashedError(stack)) {
		return 'The browser crashed while rendering the video. Deploy a new function with memory to give the browser more resources.';
	}

	return null;
};

export const inspectErrors = <Provider extends CloudProvider>({
	errors,
	providerSpecifics,
}: {
	errors: FunctionErrorInfo[];
	providerSpecifics: ProviderSpecifics<Provider>;
}): EnhancedErrorInfo[] => {
	return errors.map((e): EnhancedErrorInfo => {
		return {
			...e,
			explanation: getExplanation(e.stack, providerSpecifics),
			s3Location: '',
		};
	});
};
