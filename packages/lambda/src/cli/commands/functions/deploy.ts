import {CliInternals} from '@remotion/cli';
import {AwsProvider, LambdaClientInternals} from '@remotion/lambda-client';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	DEFAULT_MEMORY_SIZE,
	DEFAULT_TIMEOUT,
} from '@remotion/lambda-client/constants';
import type {LogLevel} from '@remotion/renderer';
import {FullClientSpecifics, ProviderSpecifics} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {internalDeployFunction} from '../../../api/deploy-function';
import {validateCustomRoleArn} from '../../../shared/validate-custom-role-arn';
import {validateTimeout} from '../../../shared/validate-timeout';
import {validateVpcSecurityGroupIds} from '../../../shared/validate-vpc-security-group-ids';
import {validateVpcSubnetIds} from '../../../shared/validate-vpc-subnet-ids';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {Log} from '../../log';

export const FUNCTIONS_DEPLOY_SUBCOMMAND = 'deploy';

export const functionsDeploySubcommand = async ({
	logLevel,
	providerSpecifics,
	fullClientSpecifics,
}: {
	logLevel: LogLevel;
	providerSpecifics: ProviderSpecifics<AwsProvider>;
	fullClientSpecifics: FullClientSpecifics<AwsProvider>;
}) => {
	const region = getAwsRegion();
	const timeoutInSeconds = parsedLambdaCli.timeout ?? DEFAULT_TIMEOUT;
	const memorySizeInMb = parsedLambdaCli.memory ?? DEFAULT_MEMORY_SIZE;
	const diskSizeInMb = parsedLambdaCli.disk ?? DEFAULT_EPHEMERAL_STORAGE_IN_MB;
	const customRoleArn = parsedLambdaCli['custom-role-arn'] ?? undefined;
	const createCloudWatchLogGroup = !parsedLambdaCli['disable-cloudwatch'];
	const enableLambdaInsights =
		parsedLambdaCli['enable-lambda-insights'] ?? false;
	const cloudWatchLogRetentionPeriodInDays =
		parsedLambdaCli['retention-period'] ?? DEFAULT_CLOUDWATCH_RETENTION_PERIOD;
	const enableV5Runtime = parsedLambdaCli['enable-v5-runtime'] ?? undefined;
	if (enableV5Runtime) {
		Log.warn(
			{logLevel, indent: false},
			`The --enable-v5-runtime flag is now enabled by default and has no function anymore.`,
		);
	}
	const vpcSubnetIds = parsedLambdaCli['vpc-subnet-ids'] ?? undefined;
	const vpcSecurityGroupIds =
		parsedLambdaCli['vpc-security-group-ids'] ?? undefined;
	const runtimePreference = parsedLambdaCli['runtime-preference'] ?? 'default';

	LambdaClientInternals.validateMemorySize(memorySizeInMb);
	validateTimeout(timeoutInSeconds);
	LambdaClientInternals.validateDiskSizeInMb(diskSizeInMb);
	validateCustomRoleArn(customRoleArn);
	validateVpcSubnetIds(vpcSubnetIds);
	validateVpcSecurityGroupIds(vpcSecurityGroupIds);
	if (!CliInternals.quietFlagProvided()) {
		CliInternals.Log.info(
			{indent: false, logLevel},
			CliInternals.chalk.gray(
				`
Region = ${region}
Memory = ${memorySizeInMb}MB
Disk size = ${diskSizeInMb}MB
Timeout = ${timeoutInSeconds}sec
Version = ${VERSION}
CloudWatch Logging Enabled = ${createCloudWatchLogGroup}
CloudWatch Retention Period = ${cloudWatchLogRetentionPeriodInDays} days
Lambda Insights Enabled = ${enableLambdaInsights}

				`.trim(),
			),
		);
		if (vpcSubnetIds) {
			CliInternals.Log.info(
				{indent: false, logLevel},
				`
VPC Subnet IDs = ${vpcSubnetIds}
VPC Security Group IDs = ${vpcSecurityGroupIds}
`.trim(),
			);
		}
	}

	const output = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		// No browser logs
		updatesDontOverwrite: false,
		indent: false,
	});
	output.update('Deploying Lambda...', false);
	const {functionName, alreadyExisted} = await internalDeployFunction({
		createCloudWatchLogGroup,
		region,
		timeoutInSeconds,
		memorySizeInMb,
		cloudWatchLogRetentionPeriodInDays,
		diskSizeInMb,
		customRoleArn,
		enableLambdaInsights,
		indent: false,
		logLevel,
		vpcSubnetIds,
		vpcSecurityGroupIds,
		runtimePreference,
		providerSpecifics,
		fullClientSpecifics,
	});
	if (CliInternals.quietFlagProvided()) {
		CliInternals.Log.info({indent: false, logLevel}, functionName);
	} else if (alreadyExisted) {
		output.update(`Already exists as ${functionName}`, true);
	} else {
		output.update(`Deployed as ${functionName}\n`, true);
	}
};
