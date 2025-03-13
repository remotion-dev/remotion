import {LambdaClientInternals} from '@remotion/lambda-client';
import {expect, test} from 'bun:test';
import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import path from 'path';

test('Set the right version for gotest', () => {
	const referenceVersion = readFileSync(
		path.join(process.cwd(), '..', 'core', 'package.json'),
		'utf-8',
	);

	const referenceVersionJson = JSON.parse(referenceVersion);
	const version = referenceVersionJson.version;
	expect(typeof version).toBe('string');

	const VERSION = `package lambda_go_sdk;\n\nconst VERSION = "${version}"`;
	writeFileSync(
		path.join(process.cwd(), '..', 'lambda-go', 'version.go'),
		VERSION,
	);
});

test('Go package should create the same payload as normal Lambda package', async () => {
	const goOutput = execSync('go test', {
		cwd: path.join(process.cwd(), '..', 'lambda-go'),
	});
	const firstLine = goOutput.toString().split('\n')[0];
	const parsed = JSON.parse(firstLine);

	const nativeVersion =
		await LambdaClientInternals.makeLambdaRenderMediaPayload({
			region: 'us-east-1',
			composition: 'react-svg',
			functionName: 'remotion-render',
			serveUrl: 'testbed',
			codec: 'h264',
			audioBitrate: null,
			audioCodec: null,
			chromiumOptions: {},
			colorSpace: null,
			concurrencyPerLambda: 1,
			crf: undefined,
			deleteAfter: null,
			downloadBehavior: {type: 'play-in-browser'},
			envVariables: {},
			everyNthFrame: 1,
			forceBucketName: null,
			forceHeight: null,
			forceWidth: null,
			frameRange: null,
			framesPerLambda: null,
			imageFormat: 'jpeg',
			jpegQuality: 80,
			logLevel: 'info',
			maxRetries: 1,
			muted: false,
			numberOfGifLoops: 0,
			offthreadVideoCacheSizeInBytes: null,
			offthreadVideoThreads: null,
			outName: null,
			overwrite: false,
			pixelFormat: undefined,
			privacy: 'public',
			proResProfile: undefined,
			rendererFunctionName: null,
			scale: 1,
			timeoutInMilliseconds: 30000,
			videoBitrate: null,
			encodingMaxRate: null,
			encodingBufferSize: null,
			webhook: null,
			x264Preset: null,
			inputProps: {},
			preferLossless: false,
			indent: false,
			forcePathStyle: false,
			metadata: {
				Author: 'Remotion',
			},
			apiKey: null,
		});

	expect(removeUndefined(parsed)).toEqual(removeUndefined(nativeVersion));
});

const removeUndefined = (data: unknown) => {
	return JSON.parse(JSON.stringify(data));
};
