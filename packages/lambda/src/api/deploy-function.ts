import {CreateFunctionCommand} from '@aws-sdk/client-lambda';
import {readFileSync} from 'fs';
import {AwsRegion} from '../pricing/aws-regions';
import {getLambdaClient} from '../shared/aws-clients';
import {RENDER_FN_PREFIX} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {randomHash} from '../shared/random-hash';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateMemorySize} from '../shared/validate-memory-size';
import {validateTimeout} from '../shared/validate-timeout';
import {bundleLambda} from './bundle-lambda';

export const deployFunction = async (options: {
	region: AwsRegion;
	layerArn: string;
	timeoutInSeconds: number;
	memorySizeInMb: number;
}) => {
	validateMemorySize(options.memorySizeInMb);
	validateTimeout(options.timeoutInSeconds);
	validateAwsRegion(options.region);

	const fnNameRender = RENDER_FN_PREFIX + randomHash();
	const [renderOut, accountId] = await Promise.all([
		bundleLambda(),
		getAccountId({region: options.region}),
	]);

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
			MemorySize: options.memorySizeInMb,
			Timeout: options.timeoutInSeconds,
			Layers: [options.layerArn],
		})
	);

	if (!created.FunctionName) {
		throw new Error('Lambda was created but has no name');
	}

	return {
		functionName: created.FunctionName,
	};
};
