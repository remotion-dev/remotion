import path from 'node:path';
import type {DownloadMap} from './assets/download-map';
import {callFf} from './call-ffmpeg';
import {chunk} from './chunk';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {OUTPUT_FILTER_NAME} from './create-ffmpeg-merge-filter';
import {createSilentAudio} from './create-silent-audio';
import {deleteDirectory} from './delete-directory';
import type {LogLevel} from './log-level';
import {pLimit} from './p-limit';
import type {PreprocessedAudioTrack} from './preprocess-audio-track';
import {tmpDir} from './tmp-dir';
import {truthy} from './truthy';

type Options = {
	files: PreprocessedAudioTrack[];
	outName: string;
	numberOfSeconds: number;
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
	logLevel: LogLevel;
	forceLossless: boolean;
	binariesDirectory: string | null;
};

const mergeAudioTrackUnlimited = async ({
	outName,
	files,
	numberOfSeconds,
	downloadMap,
	remotionRoot,
	indent,
	logLevel,
	forceLossless,
	binariesDirectory,
}: Options): Promise<void> => {
	if (files.length === 0) {
		await createSilentAudio({
			outName,
			numberOfSeconds,
			indent,
			logLevel,
			binariesDirectory,
		});
		return;
	}

	// Previously a bug: We cannot optimize for files.length === 1 because we need to pad the audio

	// In FFMPEG, the total number of left and right tracks that can be merged at one time is limited to 64
	if (files.length >= 32) {
		const chunked = chunk(files, 10);
		const tempPath = tmpDir('remotion-large-audio-mixing');

		try {
			const chunkNames = await Promise.all(
				chunked.map(async (chunkFiles, i) => {
					const chunkOutname = path.join(tempPath, `chunk-${i}.wav`);
					await mergeAudioTrack({
						files: chunkFiles,
						numberOfSeconds,
						outName: chunkOutname,
						downloadMap,
						remotionRoot,
						indent,
						logLevel,
						forceLossless: true,
						binariesDirectory,
					});
					return chunkOutname;
				}),
			);

			await mergeAudioTrack({
				files: chunkNames.map((c) => ({
					filter: {
						pad_end: null,
						pad_start: null,
					},
					outName: c,
				})),
				numberOfSeconds,
				outName,
				downloadMap,
				remotionRoot,
				indent,
				logLevel,
				forceLossless: false,
				binariesDirectory,
			});
			return;
		} finally {
			deleteDirectory(tempPath);
		}
	}

	const {complexFilterFlag: mergeFilter, cleanup} =
		await createFfmpegComplexFilter({
			filters: files,
			downloadMap,
		});

	// TODO: Make AAC dynamic
	// TODO: Add bitrate
	// TODO: Add cutoff
	const args = [
		...files.map((f) => ['-i', f.outName]),
		mergeFilter,
		['-c:a', forceLossless ? 'pcm_s16le' : 'libfdk_aac'],
		forceLossless ? null : ['-f', 'adts'],
		['-map', `[${OUTPUT_FILTER_NAME}]`],
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);
	const task = callFf({
		bin: 'ffmpeg',
		args,
		indent,
		logLevel,
		binariesDirectory,
	});
	await task;
	cleanup();
};

// Must be at least 3 because recursively called twice in mergeAudioTrack
const limit = pLimit(3);

export const mergeAudioTrack = (options: Options) => {
	return limit(mergeAudioTrackUnlimited, options);
};
