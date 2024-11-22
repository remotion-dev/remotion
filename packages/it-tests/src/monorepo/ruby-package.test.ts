import {LambdaInternals} from '@remotion/lambda';
import {expect, test} from 'bun:test';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {VERSION} from 'remotion';

const rubySdk = path.join(__dirname, '..', '..', '..', 'lambda-ruby');
test('Set the right version for Ruby', () => {
	const versionPath = path.join(rubySdk, 'lib', 'version.rb');

	fs.writeFileSync(versionPath, `VERSION = "${VERSION}"`);
});

test('Render progress payload', () => {
	const output = execSync('ruby lib/render_progress_payload_spec.rb', {
		cwd: rubySdk,
	}).toString();
	const nativeVersion = LambdaInternals.getRenderProgressPayload({
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
	const output = execSync('ruby lib/render_media_on_lambda_payload_spec.rb', {
		cwd: rubySdk,
	}).toString();

	const nativeVersion = await LambdaInternals.makeLambdaRenderMediaPayload({
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
	});

	expect(JSON.parse(output)).toEqual(nativeVersion);
});
