import {RENDER_FN_PREFIX} from './constants';
import {LAMBDA_VERSION_STRING} from './lambda-version-string';

export type SpeculateFunctionNameInput = {
	memorySizeInMb: string | number;
	diskSizeInMb: string | number;
	timeoutInSeconds: string | number;
};

export const innerSpeculateFunctionName = ({
	diskSizeInMb,
	memorySizeInMb,
	timeoutInSeconds,
}: SpeculateFunctionNameInput) => {
	// No validation here, used in find-function-name.ts
	return [
		`${RENDER_FN_PREFIX}${LAMBDA_VERSION_STRING}`,
		`mem${memorySizeInMb}mb`,
		`disk${diskSizeInMb}mb`,
		`${timeoutInSeconds}sec`,
	].join('-');
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
	const memorySize = Number(memorySizeInMb);
	const diskSize = Number(diskSizeInMb);
	const timeout = Number(timeoutInSeconds);

	if (!Number.isInteger(memorySize) || memorySize <= 0) {
		throw new Error(
			`Memory size must be a positive integer. Received: ${memorySizeInMb}`,
		);
	}

	if (!Number.isInteger(diskSize) || diskSize <= 0) {
		throw new Error(
			`Disk size must be a positive integer. Received: ${diskSizeInMb}`,
		);
	}

	if (!Number.isInteger(timeout) || timeout <= 0) {
		throw new Error(
			`Timeout must be a positive integer. Received: ${timeoutInSeconds}`,
		);
	}

	return innerSpeculateFunctionName({
		diskSizeInMb,
		memorySizeInMb,
		timeoutInSeconds,
	});
};
