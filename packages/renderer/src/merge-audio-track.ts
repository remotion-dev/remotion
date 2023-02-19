import execa from 'execa';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import {chunk} from './chunk';
import {getExecutablePath} from './compositor/get-executable-path';
import {convertToPcm} from './convert-to-pcm';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import {pLimit} from './p-limit';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type Options = {
	files: string[];
	outName: string;
	numberOfSeconds: number;
	downloadMap: DownloadMap;
	remotionRoot: string;
};

const mergeAudioTrackUnlimited = async ({
	outName,
	files,
	numberOfSeconds,
	downloadMap,
	remotionRoot,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			numberOfSeconds,
		});
		return;
	}

	if (files.length === 1) {
		await convertToPcm({
			outName,
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
					files: chunkFiles,
					numberOfSeconds,
					outName: chunkOutname,
					downloadMap,
					remotionRoot,
				});
				return chunkOutname;
			})
		);

		await mergeAudioTrack({
			files: chunkNames,
			numberOfSeconds,
			outName,
			downloadMap,
			remotionRoot,
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
	const task = execa(getExecutablePath('ffmpeg'), args, {
		cwd: getExecutablePath('ffmpeg-cwd'),
	});
	await task;
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
