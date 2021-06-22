import {GetUserCommand} from '@aws-sdk/client-iam';
import {CreateFunctionCommand} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {AwsRegion} from '../pricing/aws-regions';
import {getIamClient, getLambdaClient} from '../shared/aws-clients';
import {MEMORY_SIZE, RENDER_FN_PREFIX} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {bundleLambda} from './bundle-lambda';

export const deployLambda = async (options: {
	region: AwsRegion;
	layerArn: string;
	timeoutInSeconds: number;
}) => {
	const fnNameRender = RENDER_FN_PREFIX + randomHash();
	const [renderOut, user] = await Promise.all([
		bundleLambda('render'),
		getIamClient(options.region).send(new GetUserCommand({})),
	]);

	const accountId = user.User?.Arn?.match(/aws:iam::([0-9]+)/);

	if (!accountId) {
		throw new Error('Cannot get account ID');
	}

	const created = await getLambdaClient(options.region).send(
		new CreateFunctionCommand({
			Code: {
				ZipFile: readFileSync(renderOut),
			},
			FunctionName: fnNameRender,
			Handler: 'index.handler',
			// TODO: Give helpful suggestion if user did not create role
			Role: `arn:aws:iam::${accountId[1]}:role/remotion-lambda-role`,
			Runtime: 'nodejs14.x',
			Description: 'Renders a Remotion video.',
			MemorySize: MEMORY_SIZE,
			Timeout: options.timeoutInSeconds,
			Layers: [options.layerArn],
		})
	);

	console.log('lambdas created');

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
	};
};
