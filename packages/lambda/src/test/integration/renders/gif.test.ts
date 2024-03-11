import {RenderInternals} from '@remotion/renderer';
import {createWriteStream, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {VERSION} from 'remotion/version';
import {afterAll, expect, test} from 'vitest';
import {makeLambdaRenderMediaPayload} from '../../../api/make-lambda-payload';
import {renderMediaOnLambdaOptionalToRequired} from '../../../api/render-media-on-lambda';
import {LambdaRoutines} from '../../../defaults';
import {lambdaReadFile} from '../../../functions/helpers/io';
import {callLambda} from '../../../shared/call-lambda';

afterAll(async () => {
	await RenderInternals.killAllBrowsers();
});

test('Should make a distributed GIF', async () => {
	process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '2048';

	const res = await callLambda({
		type: LambdaRoutines.start,
		payload: await makeLambdaRenderMediaPayload(
			renderMediaOnLambdaOptionalToRequired({
				serveUrl:
					'https://64d3734a6bb69052c34d3616--spiffy-kelpie-71657b.netlify.app/',
				codec: 'gif',
				composition: 'framer',
				// 61 frames, which is uneven, to challenge the frame planner
				frameRange: [0, 60],
				framesPerLambda: 8,
				imageFormat: 'png',
				logLevel: 'error',
				outName: 'out.gif',
				timeoutInMilliseconds: 12000,
				everyNthFrame: 2,
				functionName: 'remotion-dev-lambda',
				region: 'eu-central-1',
			}),
		),
		functionName: 'remotion-dev-lambda',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const progress = await callLambda({
		type: LambdaRoutines.status,
		payload: {
			bucketName: res.bucketName,
			renderId: res.renderId,
			version: VERSION,
			logLevel: 'error',
		},
		functionName: 'remotion-dev-lambda',
		receivedStreamingPayload: () => undefined,
		region: 'eu-central-1',
		timeoutInTest: 120000,
		retriesRemaining: 0,
	});

	const file = await lambdaReadFile({
		bucketName: progress.outBucket as string,
		key: progress.outKey as string,
		expectedBucketOwner: 'abc',
		region: 'eu-central-1',
	});

	const out = path.join(tmpdir(), 'gif.gif');

	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream(out)).on('close', () => resolve());
	});
	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [out],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	unlinkSync(out);
	expect(probe.stderr).toMatch(/Video: gif, bgra, 1080x1080/);
}, 90000);
