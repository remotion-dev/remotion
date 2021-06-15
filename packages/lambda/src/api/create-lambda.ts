import {GetUserCommand} from '@aws-sdk/client-iam';
import {CreateFunctionCommand} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {iamClient, lambdaClient} from '../shared/aws-clients';
import {MEMORY_SIZE, RENDER_FN_PREFIX} from '../shared/constants';
import {randomHash} from '../shared/random-hash';
import {bundleLambda} from './bundle-lambda';
import {ensureLayers} from './lambda-layers';

export const deployLambda = async () => {
	const {layerArn} = await ensureLayers(lambdaClient);
	console.log('Done creating layers');
	const fnNameRender = RENDER_FN_PREFIX + randomHash();
	const renderOut = await bundleLambda('render');
	console.log('done Bundling');

	const user = await iamClient.send(new GetUserCommand({}));

	const accountId = user.User?.Arn?.match(/aws:iam::([0-9]+)/);

	if (!accountId) {
		throw new Error('Cannot get account ID');
	}

	const created = await lambdaClient.send(
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
			// TODO: Set timeout
			Timeout: 120,
			Layers: [layerArn],
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
