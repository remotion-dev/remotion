import {LambdaClientInternals} from '@remotion/lambda-client';
import {$} from 'bun';
import {beforeAll, describe, expect, test} from 'bun:test';
import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';
import path from 'path';

const referenceVersion = readFileSync(
	path.join(process.cwd(), '..', 'core', 'package.json'),
	'utf-8',
);
const referenceVersionJson = JSON.parse(referenceVersion);
const version = referenceVersionJson.version;

beforeAll(async () => {
	await $`php composer.phar update --quiet --lock`.cwd(
		path.join(process.cwd(), '..', 'lambda-php'),
	);
});

describe('These should run serially', () => {
	test('Set the right version for phpunit', () => {
		expect(typeof version).toBe('string');

		const VERSION = `
<?php

namespace Remotion\\LambdaPhp;

class Semantic
{
    public const VERSION = "${version}";
}  
  `.trim();
		writeFileSync(
			path.join(process.cwd(), '..', 'lambda-php', 'src', 'Semantic.php'),
			VERSION,
		);
	});

	test('Set the right version for composer.json', () => {
		const composerJson = readFileSync(
			path.join(process.cwd(), '..', 'lambda-php', 'composer.json'),
			'utf-8',
		);
		const composerJsonJson = JSON.parse(composerJson);
		composerJsonJson.version = version;
		writeFileSync(
			path.join(process.cwd(), '..', 'lambda-php', 'composer.json'),
			JSON.stringify(composerJsonJson, null, 2) + '\n',
		);
	});

	test('Set the right version for composer.json in example', () => {
		const composerJson = readFileSync(
			path.join(process.cwd(), '..', 'lambda-php-example', 'composer.json'),
			'utf-8',
		);
		const composerJsonJson = JSON.parse(composerJson);
		composerJsonJson.require['remotion/lambda'] = version;
		writeFileSync(
			path.join(process.cwd(), '..', 'lambda-php-example', 'composer.json'),
			JSON.stringify(composerJsonJson, null, 2) + '\n',
		);
	});

	test('PHP package should create the same renderMedia payload as normal Lambda package', async () => {
		execSync('php composer.phar --quiet install', {
			cwd: path.join(process.cwd(), '..', 'lambda-php'),
		});
		const phpOutput = execSync('php phpunit.phar ./tests/PHPClientTest.php', {
			cwd: path.join(process.cwd(), '..', 'lambda-php'),
		});
		const output = phpOutput.toString().split('\n');
		const toParse = output[5];
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
				preferLossless: false,
				indent: false,
				forcePathStyle: false,
				metadata: {
					Author: 'Remotion',
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

	test('PHP package should create the same progress payload as normal Lambda package', async () => {
		execSync('php composer.phar --quiet install', {
			cwd: path.join(process.cwd(), '..', 'lambda-php'),
		});
		const phpOutput = execSync(
			'php phpunit.phar ./tests/PHPRenderProgressTest.php',
			{
				cwd: path.join(process.cwd(), '..', 'lambda-php'),
			},
		);
		const output = phpOutput.toString().split('\n');
		const toParse = output[5];
		const nativeVersion = LambdaClientInternals.getRenderProgressPayload({
			region: 'us-east-1',
			functionName: 'remotion-render',
			bucketName: 'remotion-render',
			renderId: 'abcdef',
			logLevel: 'info',
		});
		const jsonOutput = toParse.substring(0, toParse.lastIndexOf('}') + 1);
		const parsedJson = JSON.parse(jsonOutput);
		expect(parsedJson).toEqual({...nativeVersion, s3OutputProvider: null});
	});
});
