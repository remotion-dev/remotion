import {
	CreateFunctionCommand,
	PutFunctionEventInvokeConfigCommand,
} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {AwsRegion} from '..';
import {Log} from '../cli/log';
import {getLambdaClient} from '../shared/aws-clients';
import {hostedLayers} from '../shared/hosted-layers';

export const createFunction = async ({
	region,
	zipFile,
	functionName,
	accountId,
	memorySizeInMb,
	timeoutInSeconds,
}: {
	region: AwsRegion;
	zipFile: string;
	functionName: string;
	accountId: string;
	memorySizeInMb: number;
	timeoutInSeconds: number;
}) => {
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
