import execa from 'execa';
import fs from 'fs';
import {FfmpegExecutable, Internals} from 'remotion';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	files: string[];
	outName: string;
	onProgress: (progress: number) => void;
};

export const mergeAudioTrack = async ({
	ffmpegExecutable,
	outName,
	files,
	onProgress,
}: Options) => {
	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter(files.length);

	if (files.length === 1) {
		await fs.promises.copyFile(files[0], outName);
		onProgress(1);
		return;
	}

	const args = [
		...files.map((f) => ['-i', f]),
		mergeFilter,
		['-map', '[a]'],
		['-y', outName],
	]
		.filter(Internals.truthy)
		.flat(2);

	const task = execa(ffmpegExecutable ?? 'ffmpeg', args);

	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		const parsed = parseFfmpegProgress(str);
		if (parsed !== undefined) {
			onProgress(parsed);
		}
	});

	await task;
	cleanup();
};
