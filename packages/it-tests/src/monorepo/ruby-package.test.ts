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

test('Ruby package', () => {
	const output = execSync('ruby lib/sdk_spec.rb', {
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
