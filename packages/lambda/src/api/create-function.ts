import {
	CreateLogGroupCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {CreateFunctionCommand} from '@aws-sdk/client-lambda';
import {Log} from '@remotion/cli/dist/log';
import {readFileSync} from 'fs';
import {AwsRegion} from '..';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	LOG_GROUP_PREFIX,
} from '../defaults';
import {getCloudWatchLogsClient, getLambdaClient} from '../shared/aws-clients';

export const createFunction = async ({
	createCloudWatchLogGroup = false,
	region,
	zipFile,
	functionName,
	accountId,
	memorySizeInMb,
	timeoutInSeconds,
	layerArn,
}: {
	createCloudWatchLogGroup?: boolean;
	region: AwsRegion;
	zipFile: string;
	functionName: string;
	accountId: string;
	memorySizeInMb: number;
	timeoutInSeconds: number;
	layerArn: string;
}) => {
	if (createCloudWatchLogGroup) {
		Log.info(`Creating CloudWatch Log Group...`);

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
			Layers: [layerArn],
		})
	);
	return {FunctionName};
};
