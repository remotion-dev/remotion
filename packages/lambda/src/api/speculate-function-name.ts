import {RENDER_FN_PREFIX} from '../defaults';
import {LAMBDA_VERSION_STRING} from '../shared/lambda-version-string';

export type SpeculateFunctionNameInput = {
	memorySizeInMb: string | number;
	diskSizeInMb: string | number;
	timeoutInSeconds: string | number;
};

/**
 * @description Speculate the name of a lambda function that will be created when you call `deployFunction`, based on the function configuration.
 * @see [Documentation](https://www.remotion.dev/docs/lambda/speculatefunctionname)
 * @param params.memorySizeInMb How much memory is allocated to the Lambda function.
 * @param params.diskSizeInMb The amount of storage the function is allocated.
 * @param params.timeoutInSeconds Time in seconds until the function times out.
 * @returns {string} The speculated lambda function name
 */
export const speculateFunctionName = ({
	memorySizeInMb,
	diskSizeInMb,
	timeoutInSeconds,
}: SpeculateFunctionNameInput) => {
	return [
		`${RENDER_FN_PREFIX}${LAMBDA_VERSION_STRING}`,
		`mem${memorySizeInMb}mb`,
		`disk${diskSizeInMb}mb`,
		`${timeoutInSeconds}sec`,
	].join('-');
};
