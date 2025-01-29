import {parseMedia} from '@remotion/media-parser';
import {nodeReader} from '@remotion/media-parser/node';
import {$} from 'bun';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {hasBenchmark} from './persistance';
import {BenchmarkItem, getBenchmarkKey, QualityControl} from './types';

const stringifyQualityControl = (qualityControl: QualityControl) => {
	if (qualityControl.type === 'crf') {
		return [`-crf`, `${qualityControl.crf}`];
	}
	if (qualityControl.type === 'bitrate') {
		return [`-b:v`, `${qualityControl.value}`];
	}

	throw new Error(
		'Unknown quality control ' + (qualityControl satisfies never),
	);
};

export const runBenchmark = async ({
	exampleVideo,
	encoder,
	qualityControl,
	benchmarks,
}: {
	exampleVideo: string;
	encoder: string;
	qualityControl: QualityControl;
	benchmarks: BenchmarkItem[];
}): Promise<BenchmarkItem> => {
	const filename = path.basename(exampleVideo);

	const key = getBenchmarkKey({
		filename,
		encoder,
		qualityControl,
	});

	const found = hasBenchmark(benchmarks, key);
	if (found) {
		return found;
	}

	const {dimensions, fps, durationInSeconds} = await parseMedia({
		src: exampleVideo,
		fields: {
			dimensions: true,
			durationInSeconds: true,
			fps: true,
		},
		reader: nodeReader,
	});

	if (!durationInSeconds) {
		throw new Error('Could not get duration of video');
	}
	if (!fps) {
		throw new Error('Could not get fps of video');
	}
	if (!dimensions) {
		throw new Error('Could not get fps of video');
	}

	const output = `${os.tmpdir()}/output.mp4`;

	const time = Date.now();
	await $`bunx remotion ffmpeg -hide_banner -i ${exampleVideo} -c:v ${encoder} ${stringifyQualityControl(qualityControl)} -an -y ${output}`
		.cwd(path.join(__dirname, '..', '..', '..', 'example'))
		.quiet();
	const timeToEncodeInMs = Date.now() - time;

	const size = fs.lstatSync(output).size;

	fs.unlinkSync(output);

	const item: BenchmarkItem = {
		filename,
		encoder,
		quality: qualityControl,
		width: dimensions.width,
		height: dimensions.height,
		fps,
		durationInSeconds,
		size,
		timeToEncodeInMs,
	};

	return item;
};
