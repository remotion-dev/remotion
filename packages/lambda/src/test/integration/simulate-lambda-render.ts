import {RenderInternals} from '@remotion/renderer';
import {ServerlessRoutines} from '@remotion/serverless/client';
import path from 'path';
import {VERSION} from 'remotion/version';
import {makeLambdaRenderMediaPayload} from '../../api/make-lambda-payload';
import type {RenderMediaOnLambdaInput} from '../../api/render-media-on-lambda';
import {renderMediaOnLambdaOptionalToRequired} from '../../api/render-media-on-lambda';
import type {AwsProvider} from '../../functions/aws-implementation';
import {callLambda} from '../../shared/call-lambda';
import {mockImplementation} from '../mock-implementation';

const functionName = 'remotion-dev-render';

const waitUntilDone = async (bucketName: string, renderId: string) => {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const progress = await callLambda({
			type: ServerlessRoutines.status,
			payload: {
				bucketName,
				renderId,
				version: VERSION,
				logLevel: 'error',
				forcePathStyle: false,
				s3OutputProvider: null,
			},
			functionName: 'remotion-dev-lambda',
			region: 'eu-central-1',
			timeoutInTest: 120000,
		});
		if (progress.done) {
			return progress;
		}

		if (progress.fatalErrorEncountered) {
			throw new Error(progress.errors.join('\n'));
		}

		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});
	}
};

export const simulateLambdaRender = async (
	input: Omit<RenderMediaOnLambdaInput, 'serveUrl' | 'functionName'>,
) => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const exampleBuild = path.join(process.cwd(), '..', 'example', 'build');

	const {port, close} = await RenderInternals.serveStatic(exampleBuild, {
		binariesDirectory: null,
		concurrency: 1,
		downloadMap: RenderInternals.makeDownloadMap(),
		indent: false,
		logLevel: 'error',
		offthreadVideoCacheSizeInBytes: null,
		port: null,
		remotionRoot: path.dirname(exampleBuild),
		forceIPv4: false,
	});

	const payload = await makeLambdaRenderMediaPayload(
		renderMediaOnLambdaOptionalToRequired({
			...input,
			serveUrl: `http://localhost:${port}`,
			functionName,
		}),
	);

	const res = await callLambda<AwsProvider, ServerlessRoutines.start>({
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
