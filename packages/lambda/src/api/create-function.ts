import {
	CreateLogGroupCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
	CreateFunctionCommand,
	PutFunctionEventInvokeConfigCommand,
} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {AwsRegion} from '../pricing/aws-regions';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	LOG_GROUP_PREFIX,
} from '../defaults';
import {getCloudWatchLogsClient, getLambdaClient} from '../shared/aws-clients';
import {hostedLayers} from '../shared/hosted-layers';
import {ROLE_NAME} from './iam-validation/suggested-policy';

export const createFunction = async ({
	createCloudWatchLogGroup,
	region,
	zipFile,
	functionName,
	accountId,
	memorySizeInMb,
	timeoutInSeconds,
}: {
	createCloudWatchLogGroup: boolean;
	region: AwsRegion;
	zipFile: string;
	functionName: string;
	accountId: string;
	memorySizeInMb: number;
	timeoutInSeconds: number;
}) => {
	if (createCloudWatchLogGroup) {
		await getCloudWatchLogsClient(region).send(
			new CreateLogGroupCommand({
				logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
			})
		);

		await getCloudWatchLogsClient(region).send(
			new PutRetentionPolicyCommand({
				logGroupName: `${LOG_GROUP_PREFIX}${functionName}`,
				retentionInDays: DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
			})
		);
	}

	const {FunctionName} = await getLambdaClient(region).send(
		new CreateFunctionCommand({
			Code: {
				ZipFile: readFileSync(zipFile),
			},
			FunctionName: functionName,
			Handler: 'index.handler',
			Role: `arn:aws:iam::${accountId}:role/${ROLE_NAME}`,
			Runtime: 'nodejs14.x',
			Description: 'Renders a Remotion video.',
			MemorySize: memorySizeInMb,
			Timeout: timeoutInSeconds,
			Layers: hostedLayers[region].map(
				({layerArn, version}) => `${layerArn}:${version}`
			),
			Architectures: ['arm64'],
		})
	);
	await getLambdaClient(region).send(
		new PutFunctionEventInvokeConfigCommand({
			MaximumRetryAttempts: 0,
			FunctionName,
		})
	);

	return {FunctionName};
};
