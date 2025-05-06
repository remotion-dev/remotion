import type {RuntimePreference} from '@remotion/lambda-client';
import {
	LambdaClientInternals,
	speculateFunctionName,
	type AwsRegion,
} from '@remotion/lambda-client';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import type {
	CloudProvider,
	FullClientSpecifics,
	ProviderSpecifics,
} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {FUNCTION_ZIP_ARM64} from '../shared/function-zip-path';
import {validateRuntimePreference} from '../shared/get-layers';
import {validateCustomRoleArn} from '../shared/validate-custom-role-arn';
import {validateCloudWatchRetentionPeriod} from '../shared/validate-retention-period';
import {validateTimeout} from '../shared/validate-timeout';

type MandatoryParameters = {
	createCloudWatchLogGroup: boolean;
	cloudWatchLogRetentionPeriodInDays?: number;
	region: AwsRegion;
	timeoutInSeconds: number;
	memorySizeInMb: number;
};

type OptionalParameters = {
	diskSizeInMb: number;
	customRoleArn: string | undefined;
	enableLambdaInsights: boolean;
	indent: boolean;
	logLevel: LogLevel;
	vpcSubnetIds: string | undefined;
	vpcSecurityGroupIds: string | undefined;
	runtimePreference: RuntimePreference;
};

export type DeployFunctionInput = MandatoryParameters &
	Partial<OptionalParameters>;

export type DeployFunctionOutput = {
	functionName: string;
	alreadyExisted: boolean;
};

export const internalDeployFunction = async <Provider extends CloudProvider>(
	params: MandatoryParameters &
		OptionalParameters & {
			providerSpecifics: ProviderSpecifics<Provider>;
			fullClientSpecifics: FullClientSpecifics<Provider>;
		},
): Promise<DeployFunctionOutput> => {
	LambdaClientInternals.validateMemorySize(params.memorySizeInMb);
	validateTimeout(params.timeoutInSeconds);
	LambdaClientInternals.validateAwsRegion(params.region);
	validateCloudWatchRetentionPeriod(params.cloudWatchLogRetentionPeriodInDays);
	LambdaClientInternals.validateDiskSizeInMb(params.diskSizeInMb);
	validateCustomRoleArn(params.customRoleArn);
	validateRuntimePreference(params.runtimePreference);

	const functionName = speculateFunctionName({
		diskSizeInMb: params.diskSizeInMb,
		memorySizeInMb: params.memorySizeInMb,
		timeoutInSeconds: params.timeoutInSeconds,
	});
	const accountId = await params.providerSpecifics.getAccountId({
		region: params.region,
	});

	const fns = await params.providerSpecifics.getFunctions({
		compatibleOnly: true,
		region: params.region,
	});

	const alreadyDeployed = fns.find(
		(f) =>
			f.version === VERSION &&
			f.memorySizeInMb === params.memorySizeInMb &&
			f.timeoutInSeconds === params.timeoutInSeconds &&
			f.diskSizeInMb === params.diskSizeInMb,
	);

	const created = await params.fullClientSpecifics.createFunction({
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
		enableLambdaInsights: params.enableLambdaInsights ?? false,
		logLevel: params.logLevel,
		vpcSubnetIds: params.vpcSubnetIds as string,
		vpcSecurityGroupIds: params.vpcSecurityGroupIds as string,
		runtimePreference: params.runtimePreference,
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
	createCloudWatchLogGroup,
	memorySizeInMb,
	region,
	timeoutInSeconds,
	cloudWatchLogRetentionPeriodInDays,
	customRoleArn,
	enableLambdaInsights,
	indent,
	logLevel,
	enableV5Runtime,
	vpcSubnetIds,
	vpcSecurityGroupIds,
	runtimePreference,
	diskSizeInMb,
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
		indent: indent ?? false,
		logLevel: logLevel ?? 'info',
		createCloudWatchLogGroup,
		customRoleArn: customRoleArn ?? undefined,
		diskSizeInMb: diskSizeInMb ?? DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: enableLambdaInsights ?? false,
		memorySizeInMb,
		region,
		timeoutInSeconds,
		cloudWatchLogRetentionPeriodInDays,
		vpcSubnetIds,
		vpcSecurityGroupIds,
		runtimePreference: runtimePreference ?? 'default',
		providerSpecifics: LambdaClientInternals.awsImplementation,
		fullClientSpecifics: awsFullClientSpecifics,
	});
};
