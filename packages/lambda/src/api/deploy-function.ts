import {
	LambdaClientInternals,
	speculateFunctionName,
	type AwsRegion,
	type RequestHandler,
	type RuntimePreference,
} from '@remotion/lambda-client';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import {VERSION} from 'remotion/version';
import {FUNCTION_ZIP_ARM64} from '../shared/function-zip-path';
import {validateRuntimePreference} from '../shared/get-layers';
import {validateCustomLayerArns} from '../shared/validate-custom-layer-arns';
import {validateCustomRoleArn} from '../shared/validate-custom-role-arn';
import {validateCloudWatchRetentionPeriod} from '../shared/validate-retention-period';
import {validateTimeout} from '../shared/validate-timeout';
import {createFunction} from './create-function';
import {getFunctionInfo} from './get-function-info';

type MandatoryParameters = {
	createCloudWatchLogGroup: boolean;
	cloudWatchLogRetentionPeriodInDays?: number;
	region: AwsRegion;
	timeoutInSeconds: number;
	memorySizeInMb: number;
};

type OptionalParameters = {
	functionName: string | null;
	diskSizeInMb: number;
	customRoleArn: string | undefined;
	enableLambdaInsights: boolean;
	indent: boolean;
	logLevel: LogLevel;
	vpcSubnetIds: string | undefined;
	vpcSecurityGroupIds: string | undefined;
	runtimePreference: RuntimePreference;
	requestHandler: RequestHandler | null;
};

export type DeployFunctionInput = MandatoryParameters &
	Partial<OptionalParameters> & {
		customLayerArns?: string[];
	};

export type DeployFunctionOutput = {
	functionName: string;
	alreadyExisted: boolean;
};

export const internalDeployFunction = async (
	params: MandatoryParameters &
		OptionalParameters & {
			customLayerArns: string[] | null;
		},
): Promise<DeployFunctionOutput> => {
	if (
		params.functionName !== null &&
		(typeof params.functionName !== 'string' ||
			params.functionName.length < 1 ||
			params.functionName.length > 64 ||
			/[^a-zA-Z0-9_-]/.test(params.functionName))
	) {
		throw new TypeError(
			'functionName must be between 1 and 64 characters long and contain only letters, numbers, hyphens and underscores.',
		);
	}

	LambdaClientInternals.validateMemorySize(params.memorySizeInMb);
	validateTimeout(params.timeoutInSeconds);
	LambdaClientInternals.validateAwsRegion(params.region);
	validateCloudWatchRetentionPeriod(params.cloudWatchLogRetentionPeriodInDays);
	LambdaClientInternals.validateDiskSizeInMb(params.diskSizeInMb);
	validateCustomRoleArn(params.customRoleArn);
	validateRuntimePreference(params.runtimePreference);
	validateCustomLayerArns({
		customLayerArns: params.customLayerArns,
		enableLambdaInsights: params.enableLambdaInsights,
		region: params.region,
		runtimePreference: params.runtimePreference,
	});

	const functionName =
		params.functionName ??
		speculateFunctionName({
			diskSizeInMb: params.diskSizeInMb,
			memorySizeInMb: params.memorySizeInMb,
			timeoutInSeconds: params.timeoutInSeconds,
		});
	const accountId = await LambdaClientInternals.getAccountIdImplementation({
		region: params.region,
	});

	const fns =
		params.functionName === null
			? await LambdaClientInternals.getFunctions({
					compatibleOnly: true,
					region: params.region,
				})
			: await getFunctionInfo({
					functionName,
					region: params.region,
					logLevel: params.logLevel,
					requestHandler: params.requestHandler ?? undefined,
				})
					.then((fn) => [fn])
					.catch((err) => {
						if ((err as Error).name === 'ResourceNotFoundException') {
							return [];
						}

						throw err;
					});

	const alreadyDeployed = fns.find(
		(f) =>
			f.functionName === functionName &&
			f.version === VERSION &&
			f.memorySizeInMb === params.memorySizeInMb &&
			f.timeoutInSeconds === params.timeoutInSeconds &&
			f.diskSizeInMb === params.diskSizeInMb,
	);
	if (params.functionName !== null && fns.length > 0 && !alreadyDeployed) {
		throw new Error(
			`A function named "${functionName}" already exists with a different Remotion version, memory size, disk size or timeout. Choose a different functionName or delete the existing function before deploying.`,
		);
	}

	const created = await createFunction({
		createCloudWatchLogGroup: params.createCloudWatchLogGroup,
		region: params.region,
		zipFile: FUNCTION_ZIP_ARM64,
		functionName,
		accountId,
		memorySizeInMb: params.memorySizeInMb,
		timeoutInSeconds: params.timeoutInSeconds,
		retentionInDays:
			params.cloudWatchLogRetentionPeriodInDays ??
			LambdaClientInternals.DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
		alreadyCreated: Boolean(alreadyDeployed),
		ephemerealStorageInMb: params.diskSizeInMb,
		customRoleArn: params.customRoleArn as string,
		customLayerArns: params.customLayerArns,
		enableLambdaInsights: params.enableLambdaInsights ?? false,
		logLevel: params.logLevel,
		vpcSubnetIds: params.vpcSubnetIds as string,
		vpcSecurityGroupIds: params.vpcSecurityGroupIds as string,
		runtimePreference: params.runtimePreference,
		requestHandler: null,
	});

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
		alreadyExisted: Boolean(alreadyDeployed),
	};
};

const errorHandled = wrapWithErrorHandling(internalDeployFunction);

/*
 * @description Creates an AWS Lambda function in your account that will be able to render a video in the cloud.
 * @see [Documentation](https://remotion.dev/docs/lambda/deployfunction)
 */
export const deployFunction = ({
	functionName,
	createCloudWatchLogGroup,
	memorySizeInMb,
	region,
	timeoutInSeconds,
	cloudWatchLogRetentionPeriodInDays,
	customRoleArn,
	customLayerArns,
	enableLambdaInsights,
	indent,
	logLevel,
	enableV5Runtime,
	vpcSubnetIds,
	vpcSecurityGroupIds,
	runtimePreference,
	diskSizeInMb,
	requestHandler,
}: DeployFunctionInput & {
	// @deprecated This option is now on by default
	enableV5Runtime?: boolean;
}) => {
	if (enableV5Runtime) {
		console.warn(
			'The `enableV5Runtime` option is now on by default. No need to specify it anymore.',
		);
	}

	return errorHandled({
		functionName: functionName ?? null,
		indent: indent ?? false,
		logLevel: logLevel ?? 'info',
		createCloudWatchLogGroup,
		customRoleArn: customRoleArn ?? undefined,
		customLayerArns: customLayerArns ?? null,
		diskSizeInMb: diskSizeInMb ?? DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: enableLambdaInsights ?? false,
		memorySizeInMb,
		region,
		timeoutInSeconds,
		cloudWatchLogRetentionPeriodInDays,
		vpcSubnetIds,
		vpcSecurityGroupIds,
		runtimePreference: runtimePreference ?? 'default',
		requestHandler,
	});
};
