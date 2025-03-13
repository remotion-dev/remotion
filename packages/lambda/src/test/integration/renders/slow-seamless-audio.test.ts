import {LambdaClientInternals} from '@remotion/lambda-client';
import {rendersPrefix} from '@remotion/serverless';
import {$} from 'bun';
import {expect, test} from 'bun:test';
import {existsSync, unlinkSync} from 'fs';
import path from 'path';
import {mockImplementation} from '../../mocks/mock-implementation';
import {streamToUint8Array} from '../../mocks/mock-store';
import {Wavedraw} from '../draw-wav';
import {simulateLambdaRender} from '../simulate-lambda-render';

test(
	'Should make slowed down seamless audio',
	async () => {
		const {close, file, progress, renderId} = await simulateLambdaRender({
			codec: 'aac',
			composition: 'framer',
			frameRange: [1700, 1740],
			imageFormat: 'none',
			logLevel: 'error',
			region: 'eu-central-1',
			framesPerLambda: 22,
			inputProps: {playbackRate: 0.5},
		});

		const wav = path.join(process.cwd(), 'slow-seamless.wav');
		if (existsSync(wav)) {
			unlinkSync(wav);
		}

		const stream = await streamToUint8Array(file);
		await $`bunx remotion ffmpeg -i - -ac 1 -c:a pcm_s16le -y ${wav} < ${stream}`.quiet();

		const wd = new Wavedraw(wav);

		const snapShot = path.join(__dirname, 'slow-seamless-audio.bmp');

		const options = {
			width: 600,
			height: 300,
			rms: true,
			maximums: true,
			average: false,
			start: 'START' as const,
			end: 'END' as const,
			colors: {
				maximums: '#0000ff',
				rms: '#659df7',
				background: '#ffffff',
			},
			filename: snapShot,
		};

		wd.drawWave(options); // outputs wave drawing to example1.png

		const files = await mockImplementation.listObjects({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			expectedBucketOwner: 'abc',
			prefix: rendersPrefix(renderId),
			forcePathStyle: false,
		});

		expect(files.length).toBe(2);

		await LambdaClientInternals.internalDeleteRender({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			renderId,
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
		});

		const expectFiles = await mockImplementation.listObjects({
			bucketName: progress.outBucket as string,
			region: 'eu-central-1',
			expectedBucketOwner: 'abc',
			prefix: rendersPrefix(renderId),
			forcePathStyle: false,
		});

		expect(expectFiles.length).toBe(0);

		unlinkSync(wav);
		await close();
	},
	{timeout: 30000},
);
