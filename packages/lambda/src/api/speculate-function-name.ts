import {RENDER_FN_PREFIX} from '../defaults';
import {LAMBDA_VERSION_STRING} from '../shared/lambda-version-string';

export type SpeculateFunctionNameInput = {
	memorySizeInMb: string | number;
	diskSizeInMb: string | number;
	timeoutInSeconds: string | number;
};

/*
 * @description Speculate the name of the Lambda function that will be created by `deployFunction()` or its CLI equivalent, based on the function configuration.
 * @see [Documentation](https://remotion.dev/docs/lambda/speculatefunctionname)
 */
export const speculateFunctionName = ({
	memorySizeInMb,
	diskSizeInMb,
	timeoutInSeconds,
}: SpeculateFunctionNameInput) => {
	// find-function-name.ts uses this for templating
	// consider this before adding any validation here
	return [
		`${RENDER_FN_PREFIX}${LAMBDA_VERSION_STRING}`,
		`mem${memorySizeInMb}mb`,
		`disk${diskSizeInMb}mb`,
		`${timeoutInSeconds}sec`,
	].join('-');
};
