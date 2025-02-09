import {
	LambdaClientInternals,
	type RenderMediaOnLambdaInput,
} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {ServerlessRoutines} from '@remotion/serverless';
import path from 'path';
import {mockImplementation} from '../mocks/mock-implementation';
import {waitUntilDone} from './wait-until-done';

const functionName = 'remotion-dev-render';

export const simulateLambdaRender = async (
	input: Omit<RenderMediaOnLambdaInput, 'serveUrl' | 'functionName'>,
) => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const exampleBuild = path.join(process.cwd(), '..', 'example', 'build');

	const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
		binariesDirectory: null,
		offthreadVideoThreads: 1,
		downloadMap: RenderInternals.makeDownloadMap(),
		indent: false,
		logLevel: 'error',
		offthreadVideoCacheSizeInBytes: null,
		port: null,
		remotionRoot: path.dirname(exampleBuild),
		forceIPv4: false,
	});

	const payload = await LambdaClientInternals.makeLambdaRenderMediaPayload(
		LambdaClientInternals.renderMediaOnLambdaOptionalToRequired({
			...input,
			serveUrl: `http://localhost:${port}`,
			functionName,
		}),
	);

	const res =
		await mockImplementation.callFunctionSync<ServerlessRoutines.start>({
			type: ServerlessRoutines.start,
			payload,
			functionName: 'remotion-dev-lambda',
			region: 'eu-central-1',
			timeoutInTest: 120000,
		});

	const progress = await waitUntilDone(res.bucketName, res.renderId);

	const file = await mockImplementation.readFile({
		bucketName: progress.outBucket as string,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
		forcePathStyle: false,
	});

	return {file, close, progress, renderId: res.renderId};
};
