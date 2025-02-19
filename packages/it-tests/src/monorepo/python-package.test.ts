import {LambdaClientInternals} from '@remotion/lambda-client';
import {expect, test} from 'bun:test';
import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import path from 'path';

const PYTHON_OUTPUT_MARKER = 10;
const referenceVersion = readFileSync(
	path.join(process.cwd(), '..', 'core', 'package.json'),
	'utf-8',
);
const referenceVersionJson = JSON.parse(referenceVersion);
const version = referenceVersionJson.version;

test('Set the right version for pytest', () => {
	expect(typeof version).toBe('string');

	const VERSION =
		`# pylint: disable=missing-module-docstring, missing-final-newline\n` +
		`VERSION = "${version}"`;
	writeFileSync(
		path.join(
			process.cwd(),
			'..',
			'lambda-python',
			'remotion_lambda',
			'version.py',
		),
		VERSION,
	);
});

test('Python package should create the same renderMedia payload as normal Lambda package', async () => {
	const cwd = path.join(process.cwd(), '..', 'lambda-python');
	const pythonOutput = execSync(
		'python -m pytest -rP  tests/test_render_client_render_media.py',
		{
			cwd,
			//stdio: "inherit",
		},
	);
	const output = pythonOutput.toString().split('\n');
	const toParse = output[PYTHON_OUTPUT_MARKER];
	const nativeVersion =
		await LambdaClientInternals.makeLambdaRenderMediaPayload({
			region: 'us-east-1',
			composition: 'react-svg',
			functionName: 'remotion-render',
			serveUrl: 'testbed',
			codec: 'h264',
			inputProps: {
				hi: 'there',
			},
			audioBitrate: null,
			audioCodec: null,
			chromiumOptions: {},
			colorSpace: null,
			concurrencyPerLambda: 1,
			crf: undefined,
			deleteAfter: null,
			downloadBehavior: {
				fileName: 'hi',
				type: 'download',
			},
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
			webhook: {
				secret: 'abc',
				url: 'https://example.com',
				customData: {
					hi: 'there',
				},
			},
			x264Preset: null,
			preferLossless: false,
			indent: false,
			forcePathStyle: false,
			metadata: {
				Author: 'Lunar',
			},
			apiKey: null,
		});
	const jsonOutput = toParse.substring(0, toParse.lastIndexOf('}') + 1);
	const parsedJson = JSON.parse(jsonOutput);

	expect({
		...parsedJson,
		type: 'start',
	}).toEqual(nativeVersion);
});

test('Python package should create the same progress payload as normal Lambda package', async () => {
	const cwd = path.join(process.cwd(), '..', 'lambda-python');
	const pythonOutput = execSync(
		'python -m pytest -rP  tests/test_get_render_progress_client.py',
		{
			cwd,
			//stdio: "inherit",
		},
	);
	const output = pythonOutput.toString().split('\n');
	const toParse = output[PYTHON_OUTPUT_MARKER];
	const nativeVersion = LambdaClientInternals.getRenderProgressPayload({
		region: 'us-east-1',
		functionName: 'remotion-render',
		bucketName: 'remotion-render',
		renderId: 'abcdef',
		logLevel: 'info',
		s3OutputProvider: {
			endpoint: 'https://s3.us-east-1.amazonaws.com',
			accessKeyId: 'accessKeyId',
			secretAccessKey: 'secretAccessKey',
			region: 'us-east-1',
		},
	});
	const jsonOutput = toParse.substring(0, toParse.lastIndexOf('}') + 1);
	const parsedJson = JSON.parse(jsonOutput);

	expect(parsedJson).toEqual(nativeVersion);
});

test('Python package should create the same renderStill payload as normal Lambda package', async () => {
	const cwd = path.join(process.cwd(), '..', 'lambda-python');
	const pythonOutput = execSync(
		'python -m pytest -rP  tests/test_render_client_render_still.py',
		{
			cwd,
			//stdio: "inherit",
		},
	);
	const output = pythonOutput.toString().split('\n');
	const toParse = output[PYTHON_OUTPUT_MARKER];
	const nativeVersion =
		await LambdaClientInternals.makeLambdaRenderStillPayload({
			region: 'us-east-1',
			composition: 'still-helloworld',
			functionName: 'remotion-render',
			serveUrl: 'testbed',
			inputProps: {
				message: 'Hello from props!',
			},
			chromiumOptions: {},
			deleteAfter: null,
			downloadBehavior: {type: 'play-in-browser'},
			envVariables: {},
			forceBucketName: null,
			forceHeight: null,
			forceWidth: null,
			imageFormat: 'jpeg',
			jpegQuality: 80,
			logLevel: 'info',
			maxRetries: 1,
			offthreadVideoCacheSizeInBytes: null,
			offthreadVideoThreads: null,
			outName: null,
			privacy: 'public',
			scale: 1,
			timeoutInMilliseconds: 30000,
			frame: 0,
			indent: false,
			onInit: () => undefined,
			dumpBrowserLogs: false,
			quality: undefined,
			forcePathStyle: false,
			apiKey: null,
		});
	const jsonOutput = toParse.substring(0, toParse.lastIndexOf('}') + 1);
	const {streamed: _, ...parsedJson} = JSON.parse(jsonOutput);
	// remove the bucketName field because request input does not have that value
	// forceBucketName is being set in bucketName
	const {bucketName, streamed, ...newObject} = nativeVersion;
	const assertValue = {
		...newObject,
		forceBucketName: nativeVersion.bucketName,
	};
	expect(removeUndefined(parsedJson)).toEqual(removeUndefined(assertValue));
});
const removeUndefined = (data: unknown) => {
	return JSON.parse(JSON.stringify(data));
};
