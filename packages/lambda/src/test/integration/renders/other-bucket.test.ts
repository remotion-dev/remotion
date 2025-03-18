import {$} from 'bun';
import {expect, test} from 'bun:test';
import path from 'path';
import {streamToUint8Array} from '../../mocks/mock-store';
import {simulateLambdaRender} from '../simulate-lambda-render';

test(
	'Should be able to render to another bucket, and silent audio should be added',
	async () => {
		const {close, file} = await simulateLambdaRender({
			codec: 'h264',
			composition: 'react-svg',
			crf: 9,
			frameRange: [0, 12],
			framesPerLambda: 8,
			logLevel: 'error',
			outName: {
				bucketName: 'my-other-bucket',
				key: 'my-key',
			},
			region: 'eu-central-1',
		});

		const stream = await streamToUint8Array(file);

		const probe = await $`bunx remotion ffprobe - < ${stream}`
			.cwd(path.join(__dirname, '..', '..', '..', '..', '..', 'example'))
			.nothrow()
			.quiet();

		const stderr = new TextDecoder().decode(probe.stderr);

		expect(stderr).toMatch(/Stream #0:0/);
		expect(stderr).toMatch(/Video: h264/);
		expect(stderr).toMatch(/Stream #0:1/);
		expect(stderr).toMatch(/Audio: aac/);

		await close();
	},
	{timeout: 30000},
);
