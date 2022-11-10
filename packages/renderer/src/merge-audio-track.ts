import execa from 'execa';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import {chunk} from './chunk';
import {convertToPcm} from './convert-to-pcm';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {pLimit} from './p-limit';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	files: string[];
	outName: string;
	numberOfSeconds: number;
	downloadMap: DownloadMap;
};

const mergeAudioTrackUnlimited = async ({
	ffmpegExecutable,
	outName,
	files,
	numberOfSeconds,
	downloadMap,
}: Options): Promise<void> => {
	console.log('MERGING AUDIO TRACKS', files.length);
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			ffmpegExecutable,
			numberOfSeconds,
		});
		return;
	}

	if (files.length === 1) {
		await convertToPcm({
			outName,
			ffmpegExecutable,
			input: files[0],
		});
		return;
	}

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);
		const tempPath = tmpDir('remotion-large-audio-mixing');

		const chunkNames = await Promise.all(
			chunked.map(async (chunkFiles, i) => {
				const chunkOutname = path.join(tempPath, `chunk-${i}.wav`);
				await mergeAudioTrack({
					ffmpegExecutable,
					files: chunkFiles,
					numberOfSeconds,
					outName: chunkOutname,
					downloadMap,
				});
				return chunkOutname;
			})
		);

		await mergeAudioTrack({
			ffmpegExecutable,
			files: chunkNames,
			numberOfSeconds,
			outName,
			downloadMap,
		});
		await deleteDirectory(tempPath);
		return;
	}

	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter(files.length, downloadMap);

	const args = [
		...files.map((f) => ['-i', f]),
		mergeFilter,
		['-c:a', 'pcm_s16le'],
		['-map', '[a]'],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);

	const task = execa(ffmpegExecutable ?? 'ffmpeg', args);

	await task;
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
