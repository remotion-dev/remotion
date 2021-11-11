import {
	CreateLogGroupCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
	CreateFunctionCommand,
	PutFunctionEventInvokeConfigCommand,
} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {AwsRegion} from '..';
import {Log} from '../cli/log';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	LOG_GROUP_PREFIX,
} from '../defaults';
import {getCloudWatchLogsClient, getLambdaClient} from '../shared/aws-clients';
import {hostedLayers} from '../shared/hosted-layers';

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
			// TODO: Give helpful suggestion if user did not create role
			Role: `arn:aws:iam::${accountId}:role/remotion-lambda-role`,
			Runtime: 'nodejs14.x',
			Description: 'Renders a Remotion video.',
			MemorySize: memorySizeInMb,
			Timeout: timeoutInSeconds,
			Layers: hostedLayers[region].map(
				({layerArn, version}) => `${layerArn}:${version}`
			),
		})
	);
	// TODO: Remove try catch in future versions
	try {
		await getLambdaClient(region).send(
			new PutFunctionEventInvokeConfigCommand({
				MaximumRetryAttempts: 0,
				FunctionName,
			})
		);
	} catch (err) {
		Log.warn(
			'\nWe now require the lambda:PutFunctionEventInvokeConfig permissions for your user. Please run `npx remotion lambda policies user` update your user policy. This will be required for the final version of Remotion Lambda.'
		);
	}

	return {FunctionName};
};
