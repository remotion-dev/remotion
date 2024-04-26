import {
	CreateLogGroupCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
	CreateFunctionCommand,
	GetFunctionCommand,
	PutFunctionEventInvokeConfigCommand,
	PutRuntimeManagementConfigCommand,
	TagResourceCommand,
} from '@aws-sdk/client-lambda';
import {readFileSync} from 'node:fs';
import {VERSION} from 'remotion/version';
import {LOG_GROUP_PREFIX} from '../defaults';
import type {AwsRegion} from '../pricing/aws-regions';
import {getCloudWatchLogsClient, getLambdaClient} from '../shared/aws-clients';
import {hostedLayers, v5HostedLayers} from '../shared/hosted-layers';
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
}): Promise<{FunctionName: string}> => {
	if (createCloudWatchLogGroup) {
		try {
			await getCloudWatchLogsClient(region).send(
				new CreateLogGroupCommand({
					logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
				}),
			);
		} catch (_err) {
			const err = _err as Error;
			if (!err.message.includes('log group already exists')) {
				throw err;
			}
		}

		await getCloudWatchLogsClient(region).send(
			new PutRetentionPolicyCommand({
				logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
				retentionInDays,
			}),
		);
	}

	if (alreadyCreated) {
		return {FunctionName: functionName};
	}

	const defaultRoleName = `arn:aws:iam::${accountId}:role/${ROLE_NAME}`;

	const layers = enableV5Runtime
		? v5HostedLayers[region]
		: hostedLayers[region];

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
		}),
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
		if (!(err as Error).name.includes('AccessDenied')) {
			throw err;
		}
	}

	await getLambdaClient(region).send(
		new PutFunctionEventInvokeConfigCommand({
			MaximumRetryAttempts: 0,
			FunctionName,
		}),
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

	const RuntimeVersionArn = enableV5Runtime
		? `arn:aws:lambda:${region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72`
		: `arn:aws:lambda:${region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72`;

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

	return {FunctionName: FunctionName as string};
};
