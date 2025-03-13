import {LambdaClientInternals} from '@remotion/lambda-client';
import {beforeAll, expect, test} from 'bun:test';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {VERSION} from 'remotion';

const rubySdk = path.join(__dirname, '..', '..', '..', 'lambda-ruby');
test('Set the right version for Ruby in version.rb', () => {
	const versionPath = path.join(
		rubySdk,
		'lib',
		'remotion_lambda',
		'version.rb',
	);

	fs.writeFileSync(versionPath, `VERSION = "${VERSION}"`);
});

beforeAll(() => {
	execSync('bundle install', {
		cwd: rubySdk,
	});
});

test('Set the right version for Ruby in remotion_lambda.gemspec', () => {
	const gemspecPath = path.join(rubySdk, 'remotion_lambda.gemspec');

	const contents = fs
		.readFileSync(gemspecPath, 'utf-8')
		.split('\n')
		.map((l) => {
			if (l.includes('s.version')) {
				return `  s.version     = "${VERSION}"`;
			}
			return l;
		})
		.join('\n');

	fs.writeFileSync(gemspecPath, contents);
});

test('Render progress payload', () => {
	const output = execSync(
		'bundle exec ruby lib/remotion_lambda/render_progress_payload_spec.rb',
		{
			cwd: rubySdk,
		},
	).toString();
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
	expect(JSON.parse(output)).toEqual(nativeVersion);
});

test('Render Media payload', async () => {
	const output = execSync(
		'ruby lib/remotion_lambda/render_media_on_lambda_payload_spec.rb',
		{
			cwd: rubySdk,
		},
	).toString();

	const nativeVersion =
		await LambdaClientInternals.makeLambdaRenderMediaPayload({
			region: 'us-east-1',
			composition: 'react-svg',
			functionName: 'remotion-render',
			serveUrl: 'testbed-v6',
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

	expect(JSON.parse(output)).toEqual(nativeVersion);
});

test('Render Still payload', async () => {
	const output = execSync(
		'ruby lib/remotion_lambda/render_still_on_lambda_payload_spec.rb',
		{
			cwd: rubySdk,
		},
	).toString();
	const nativeVersion =
		await LambdaClientInternals.makeLambdaRenderStillPayload({
			region: 'us-east-1',
			composition: 'still-helloworld',
			functionName: 'remotion-render',
			serveUrl: 'testbed-v6',
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
			offthreadVideoThreads: null,
		});

	expect(JSON.parse(output)).toEqual({...nativeVersion, streamed: false});
});
