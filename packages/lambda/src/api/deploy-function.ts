import {getFunctions} from '../api/get-functions';
import {AwsRegion} from '../pricing/aws-regions';
import {
	CURRENT_VERSION,
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	RENDER_FN_PREFIX,
} from '../shared/constants';
import {FUNCTION_ZIP} from '../shared/function-zip-path';
import {getAccountId} from '../shared/get-account-id';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateMemorySize} from '../shared/validate-memory-size';
import {validateCloudWatchRetentionPeriod} from '../shared/validate-retention-period';
import {validateTimeout} from '../shared/validate-timeout';
import {createFunction} from './create-function';

export type DeployFunctionInput = {
	createCloudWatchLogGroup: boolean;
	cloudWatchLogRetentionPeriodInDays?: number;
	region: AwsRegion;
	timeoutInSeconds: number;
	memorySizeInMb: number;
};

export type DeployFunctionOutput = {
	functionName: string;
	alreadyExisted: boolean;
};

/**
 * @description Creates an AWS Lambda function in your account that will be able to render a video in the cloud.
 * @link https://v3.remotion.dev/docs/lambda/deployfunction
 * @param options.createCloudWatchLogGroup Whether you'd like to create a CloudWatch Log Group to store the logs for this function.
 * @param options.cloudWatchLogRetentionPeriodInDays (optional) The number of days to retain the CloudWatch logs for this function. Default is 14 days.
 * @param options.region The region you want to deploy your function to.
 * @param options.timeoutInSeconds After how many seconds the lambda function should be killed if it does not end itself.
 * @param options.memorySizeInMb How much memory should be allocated to the Lambda function.
 * @returns {Promise<DeployFunctionOutput>} An object that contains the `functionName` property
 */
export const deployFunction = async (
	options: DeployFunctionInput
): Promise<DeployFunctionOutput> => {
	validateMemorySize(options.memorySizeInMb);
	validateTimeout(options.timeoutInSeconds);
	validateAwsRegion(options.region);
	validateCloudWatchRetentionPeriod(options.cloudWatchLogRetentionPeriodInDays);

	const fnNameRender = `${RENDER_FN_PREFIX}${CURRENT_VERSION}-${options.memorySizeInMb}mb-${options.timeoutInSeconds}sec`;
	const accountId = await getAccountId({region: options.region});

	const fns = await getFunctions({
		compatibleOnly: true,
		region: options.region,
	});

	const alreadyDeployed = fns.find(
		(f) =>
			f.version === CURRENT_VERSION &&
			f.memorySizeInMb === options.memorySizeInMb &&
			f.timeoutInSeconds === options.timeoutInSeconds
	);

	const created = await createFunction({
		createCloudWatchLogGroup: options.createCloudWatchLogGroup,
		region: options.region,
		zipFile: FUNCTION_ZIP,
		functionName: fnNameRender,
		accountId,
		memorySizeInMb: options.memorySizeInMb,
		timeoutInSeconds: options.timeoutInSeconds,
		retentionInDays:
			options.cloudWatchLogRetentionPeriodInDays ??
			DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
		alreadyCreated: Boolean(alreadyDeployed),
	});

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
		alreadyExisted: Boolean(alreadyDeployed),
	};
};
