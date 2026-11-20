import {expect, test} from 'bun:test';
import {createWriteStream, readFileSync, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'path';
import {
	LambdaClientInternals,
	ServerlessRoutines,
} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {makeProgressString} from '../../../cli/commands/render/progress';
import {useFakeAws} from '../../mocks/fake-aws';
import {getMockInvocationTypesForRender} from '../../mocks/mock-invocations';
import {simulateLambdaRender} from '../simulate-lambda-render';

useFakeAws();

// Browser startup, rendering, audio encoding, and output probing can exceed 5 seconds.
test('Should directly render final media with one Lambda', async () => {
	const {close, file, progress, renderId} = await simulateLambdaRender({
		codec: 'h264',
		composition: 'framer',
		frameRange: [100, 110],
		imageFormat: 'jpeg',
		logLevel: 'verbose',
		region: 'eu-central-1',
		inputProps: {},
		muted: false,
		concurrency: 1,
	});

	const tmpfile = path.join(tmpdir(), 'out.mp4');

	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream(tmpfile)).on('close', () => resolve());
	});

	// Make sure Faststart is supported: the moov box must come before mdat
	const buffer = readFileSync(tmpfile);
	const topLevelBoxes: string[] = [];
	for (let offset = 0; offset + 8 <= buffer.length; ) {
		const size32 = buffer.readUInt32BE(offset);
		const size =
			size32 === 1 ? Number(buffer.readBigUInt64BE(offset + 8)) : size32;
		topLevelBoxes.push(buffer.toString('latin1', offset + 4, offset + 8));
		if (size === 0) {
			break;
		}

		offset += size;
	}

	expect(topLevelBoxes.indexOf('moov')).toBeGreaterThan(-1);
	expect(topLevelBoxes.indexOf('moov')).toBeLessThan(
		topLevelBoxes.indexOf('mdat'),
	);

	const out = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [
			'-v',
			'error',
			'-show_entries',
			'stream=codec_type',
			'-of',
			'json',
			tmpfile,
		],
		indent: false,
		binariesDirectory: null,
		cancelSignal: undefined,
		logLevel: 'error',
	});

	expect(out.stdout).toContain('"codec_type": "video"');
	expect(out.stdout).toContain('"codec_type": "audio"');
	expect(getMockInvocationTypesForRender(renderId)).toEqual([
		ServerlessRoutines.launch,
	]);
	expect(progress.renderMetadata?.estimatedTotalLambdaInvokations).toBe(1);
	expect(progress.renderMetadata?.estimatedRenderLambdaInvokations).toBe(0);
	expect(progress.timeToCombine).toBeNull();
	const progressString = makeProgressString({
		downloadInfo: null,
		overall: progress,
	});
	expect(progressString).toContain('Invoked lambdas');
	expect(progressString).not.toContain('1/0');

	unlinkSync(tmpfile);

	const files = await LambdaClientInternals.lambdaLsImplementation({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: LambdaClientInternals.rendersPrefix(renderId),
		forcePathStyle: false,
		requestHandler: null,
	});

	expect(files.length).toBe(2);

	await LambdaClientInternals.internalDeleteRender({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		renderId,
		forcePathStyle: false,
	});

	const expectFiles = await LambdaClientInternals.lambdaLsImplementation({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: LambdaClientInternals.rendersPrefix(renderId),
		forcePathStyle: false,
		requestHandler: null,
	});

	expect(expectFiles.length).toBe(0);

	await close();
}, 60000);
