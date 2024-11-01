import {
	CreateLogGroupCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import type {VpcConfig} from '@aws-sdk/client-lambda';
import {
	CreateFunctionCommand,
	GetFunctionCommand,
	PutFunctionEventInvokeConfigCommand,
	PutRuntimeManagementConfigCommand,
	TagResourceCommand,
} from '@aws-sdk/client-lambda';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {readFileSync} from 'node:fs';
import {VERSION} from 'remotion/version';
import {LOG_GROUP_PREFIX} from '../defaults';
import type {AwsRegion} from '../regions';
import {getCloudWatchLogsClient, getLambdaClient} from '../shared/aws-clients';
import type {RuntimePreference} from '../shared/get-layers';
import {getLayers} from '../shared/get-layers';
import {lambdaInsightsExtensions} from '../shared/lambda-insights-extensions';
import {ROLE_NAME} from './iam-validation/suggested-policy';

export const createFunction = async ({
	createCloudWatchLogGroup,
	region,
	zipFile,
	functionName,
	accountId,
	memorySizeInMb,
	timeoutInSeconds,
	alreadyCreated,
	retentionInDays,
	ephemerealStorageInMb,
	customRoleArn,
	enableLambdaInsights,
	enableV5Runtime,
	logLevel,
	vpcSubnetIds,
	vpcSecurityGroupIds,
	runtimePreference,
}: {
	createCloudWatchLogGroup: boolean;
	region: AwsRegion;
	zipFile: string;
	functionName: string;
	accountId: string;
	memorySizeInMb: number;
	timeoutInSeconds: number;
	alreadyCreated: boolean;
	retentionInDays: number;
	ephemerealStorageInMb: number;
	customRoleArn: string;
	enableLambdaInsights: boolean;
	enableV5Runtime: boolean;
	logLevel: LogLevel;
	vpcSubnetIds: string;
	vpcSecurityGroupIds: string;
	runtimePreference: RuntimePreference;
}): Promise<{FunctionName: string}> => {
	if (createCloudWatchLogGroup) {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'Creating CloudWatch group',
		);
		try {
			await getCloudWatchLogsClient(region).send(
				new CreateLogGroupCommand({
					logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
				}),
			);
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				'CloudWatch group successfully created',
			);
		} catch (_err) {
			const err = _err as Error;
			if (err.message.includes('log group already exists')) {
				RenderInternals.Log.verbose(
					{indent: false, logLevel},
					'CloudWatch group already existed.',
				);
			} else {
				throw err;
			}
		}

		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'Adding retention policy to the CloudWatch group',
		);
		await getCloudWatchLogsClient(region).send(
			new PutRetentionPolicyCommand({
				logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
				retentionInDays,
			}),
		);
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			`Set retention to ${retentionInDays} days`,
		);
	}

	if (alreadyCreated) {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			`Function ${functionName} already existed`,
		);
		return {FunctionName: functionName};
	}

	const defaultRoleName = `arn:aws:iam::${accountId}:role/${ROLE_NAME}`;

	const layers = getLayers({
		option: runtimePreference,
		region,
		enableV5Runtime,
	});

	if (enableV5Runtime) {
		RenderInternals.Log.verbose(
			{indent: false, logLevel},
			'New V5 runtime enabled https://remotion.dev/docs/lambda/runtime#runtime-changes-in-remotion-50',
		);
	}

	let vpcConfig: VpcConfig | undefined;
	if (vpcSubnetIds && vpcSecurityGroupIds) {
		vpcConfig = {
			SubnetIds: vpcSubnetIds.split(','),
			SecurityGroupIds: vpcSecurityGroupIds.split(','),
		};
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Deploying new Lambda function',
	);

	const {FunctionName, FunctionArn} = await getLambdaClient(region).send(
		new CreateFunctionCommand({
			Code: {
				ZipFile: readFileSync(zipFile),
			},
			FunctionName: functionName,
			Handler: 'index.handler',
			Role: customRoleArn ?? defaultRoleName,
			Runtime: enableV5Runtime ? 'nodejs20.x' : 'nodejs18.x',
			Description: 'Renders a Remotion video.',
			MemorySize: memorySizeInMb,
			Timeout: timeoutInSeconds,
			Layers: layers
				.map(({layerArn, version}) => `${layerArn}:${version}`)
				.concat(enableLambdaInsights ? lambdaInsightsExtensions[region] : []),
			Architectures: ['arm64'],
			EphemeralStorage: {
				Size: ephemerealStorageInMb,
			},
			VpcConfig: vpcConfig,
		}),
	);

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Function deployed. Adding tags...',
	);

	try {
		await getLambdaClient(region).send(
			new TagResourceCommand({
				Resource: FunctionArn,
				Tags: {
					'remotion-lambda': 'true',
					'remotion-version': VERSION,
					'remotion-memory-in-mb': String(memorySizeInMb),
					'remotion-timeout-in-seconds': String(timeoutInSeconds),
					'remotion-ephemereal-storage-in-mb': String(ephemerealStorageInMb),
				},
			}),
		);
	} catch (err) {
		// Previous Lambda versions had no permission to tag the function
		if ((err as Error).name.includes('AccessDenied')) {
			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				'Did not have permission to tag the function. Skipping.',
			);
		} else {
			throw err;
		}
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Disabling function retries (Remotion handles retries itself)...',
	);
	await getLambdaClient(region).send(
		new PutFunctionEventInvokeConfigCommand({
			MaximumRetryAttempts: 0,
			FunctionName,
		}),
	);
	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Set function retries to 0.',
	);
	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Waiting for the function to be ready...',
	);

	let state = 'Pending';

	while (state === 'Pending') {
		const getFn = await getLambdaClient(region).send(
			new GetFunctionCommand({
				FunctionName,
			}),
		);
		await new Promise<void>((resolve) => {
			setTimeout(() => resolve(), 1000);
		});
		state = getFn.Configuration?.State as string;
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Function is now ready.',
	);

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		'Locking the runtime version of the function...',
	);

	const RuntimeVersionArn = enableV5Runtime
		? `arn:aws:lambda:${region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72`
		: `arn:aws:lambda:${region}::runtime:b97ad873eb5228db2e7d5727cd116734cc24c92ff1381739c4400c095404a2d3`;

	try {
		await getLambdaClient(region).send(
			new PutRuntimeManagementConfigCommand({
				FunctionName,
				UpdateRuntimeOn: 'Manual',
				RuntimeVersionArn,
			}),
		);
	} catch (err) {
		console.warn(
			'⚠️ Could not lock the runtime version. We recommend to update your policies to prevent your functions from breaking in the future in case the AWS runtime changes. See https://remotion.dev/docs/lambda/feb-2023-incident for an example on how to update your policy.',
		);
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		`Function runtime is locked to ${RuntimeVersionArn}`,
	);

	return {FunctionName: FunctionName as string};
};
