import {RenderInternals} from '@remotion/renderer';
import path from 'path';
import {VERSION} from 'remotion/version';
import {makeLambdaRenderMediaPayload} from '../../api/make-lambda-payload';
import type {RenderMediaOnLambdaInput} from '../../api/render-media-on-lambda';
import {renderMediaOnLambdaOptionalToRequired} from '../../api/render-media-on-lambda';
import {LambdaRoutines} from '../../defaults';
import {lambdaReadFile} from '../../functions/helpers/io';
import {callLambda} from '../../shared/call-lambda';

const functionName = 'remotion-dev-render';

export const waitUntilDone = async (bucketName: string, renderId: string) => {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const progress = await callLambda({
			type: LambdaRoutines.status,
			payload: {
				bucketName,
				renderId,
				version: VERSION,
				logLevel: 'error',
			},
			functionName: 'remotion-dev-lambda',
			onMessage: () => undefined,
			region: 'eu-central-1',
			timeoutInTest: 120000,
			retriesRemaining: 0,
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

	const res = await callLambda({
		type: LambdaRoutines.start,
		payload: await makeLambdaRenderMediaPayload(
			renderMediaOnLambdaOptionalToRequired({
				...input,
				serveUrl: `http://localhost:${port}`,
				functionName,
			}),
		),
		functionName: 'remotion-dev-lambda',
		onMessage: () => undefined,
		region: 'eu-central-1',
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const progress = await waitUntilDone(res.bucketName, res.renderId);

	const file = await lambdaReadFile({
		bucketName: progress.outBucket as string,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});

	return {file, close, progress, renderId: res.renderId};
};
