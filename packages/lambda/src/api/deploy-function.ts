import {VERSION} from 'remotion/version';
import {getFunctions} from '../api/get-functions';
import type {AwsRegion} from '../pricing/aws-regions';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	RENDER_FN_PREFIX,
} from '../shared/constants';
import {FUNCTION_ZIP_ARM64} from '../shared/function-zip-path';
import {getAccountId} from '../shared/get-account-id';
import {LAMBDA_VERSION_STRING} from '../shared/lambda-version-string';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateCustomRoleArn} from '../shared/validate-custom-role-arn';
import {validateDiskSizeInMb} from '../shared/validate-disk-size-in-mb';
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
	diskSizeInMb?: number;
	customRoleArn?: string;
};

export type DeployFunctionOutput = {
	functionName: string;
	alreadyExisted: boolean;
};

/**
 * @description Creates an AWS Lambda function in your account that will be able to render a video in the cloud.
 * @see [Documentation](https://www.remotion.dev/docs/lambda/deployfunction)
 * @param params.createCloudWatchLogGroup Whether you'd like to create a CloudWatch Log Group to store the logs for this function.
 * @param params.cloudWatchLogRetentionPeriodInDays (optional) The number of days to retain the CloudWatch logs for this function. Default is 14 days.
 * @param params.region The region you want to deploy your function to.
 * @param params.timeoutInSeconds After how many seconds the lambda function should be killed if it does not end itself.
 * @param params.memorySizeInMb How much memory should be allocated to the Lambda function.
 * @param params.architecture The architecture Lambda should run on. One of x86_64 and x64
 * @param params.diskSizeInMb The amount of storage the function should be allocated. The higher, the longer videos you can render. Default 512.
 * @returns {Promise<DeployFunctionOutput>} An object that contains the `functionName` property
 */
export const deployFunction = async (
	params: DeployFunctionInput
): Promise<DeployFunctionOutput> => {
	const diskSizeInMb = params.diskSizeInMb ?? DEFAULT_EPHEMERAL_STORAGE_IN_MB;

	validateMemorySize(params.memorySizeInMb);
	validateTimeout(params.timeoutInSeconds);
	validateAwsRegion(params.region);
	validateCloudWatchRetentionPeriod(params.cloudWatchLogRetentionPeriodInDays);
	validateDiskSizeInMb(diskSizeInMb);
	validateCustomRoleArn(params.customRoleArn);

	const fnNameRender = [
		`${RENDER_FN_PREFIX}${LAMBDA_VERSION_STRING}`,
		`mem${params.memorySizeInMb}mb`,
		`disk${diskSizeInMb}mb`,
		`${params.timeoutInSeconds}sec`,
	].join('-');
	const accountId = await getAccountId({region: params.region});

	const fns = await getFunctions({
		compatibleOnly: true,
		region: params.region,
	});

	const alreadyDeployed = fns.find(
		(f) =>
			f.version === VERSION &&
			f.memorySizeInMb === params.memorySizeInMb &&
			f.timeoutInSeconds === params.timeoutInSeconds &&
			f.diskSizeInMb === diskSizeInMb
	);

	const created = await createFunction({
		createCloudWatchLogGroup: params.createCloudWatchLogGroup,
		region: params.region,
		zipFile: FUNCTION_ZIP_ARM64,
		functionName: fnNameRender,
		accountId,
		memorySizeInMb: params.memorySizeInMb,
		timeoutInSeconds: params.timeoutInSeconds,
		retentionInDays:
			params.cloudWatchLogRetentionPeriodInDays ??
			DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
		alreadyCreated: Boolean(alreadyDeployed),
		ephemerealStorageInMb: diskSizeInMb,
		customRoleArn: params.customRoleArn as string,
	});

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
		alreadyExisted: Boolean(alreadyDeployed),
	};
};
