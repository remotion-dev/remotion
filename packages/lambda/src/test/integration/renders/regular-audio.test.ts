import {LambdaClientInternals} from '@remotion/lambda-client';
import {rendersPrefix} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {createWriteStream, unlinkSync} from 'fs';
import path from 'path';
import {mockImplementation} from '../../mocks/mock-implementation';
import {Wavedraw} from '../draw-wav';
import {simulateLambdaRender} from '../simulate-lambda-render';

test(
	'Should make regular (non-seamless) audio',
	async () => {
		const {close, file, progress, renderId} = await simulateLambdaRender({
			codec: 'wav',
			composition: 'framer',
			frameRange: [100, 200],
			imageFormat: 'none',
			region: 'eu-central-1',
			inputProps: {playbackRate: 2},
			framesPerLambda: 30,
			logLevel: 'error',
		});

		const wav = path.join(process.cwd(), 'regular.wav');
		await new Promise<void>((resolve) => {
			file.pipe(createWriteStream(wav)).on('finish', () => resolve());
		});

		const wd = new Wavedraw(wav);

		const snapShot = path.join(__dirname, 'regular-audio.bmp');

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
