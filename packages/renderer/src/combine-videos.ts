// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {rmdirSync, rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';

export const combineVideos = async ({
	files,
	filelistDir,
	output,
	onProgress,
	numberOfFrames,
}: {
	files: string[];
	filelistDir: string;
	output: string;
	onProgress: (p: number) => void;
	numberOfFrames: number;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'files.txt');
	writeFileSync(fileListTxt, fileList);

	try {
		const task = execa('ffmpeg', [
			'-f',
			'concat',
			'-safe',
			'0',
			'-i',
			fileListTxt,
			'-c:v',
			'copy',
			'-c:a',
			'aac',
			'-y',
			output,
		]);
		task.stderr?.on('data', (data: Buffer) => {
			if (onProgress) {
				const parsed = parseFfmpegProgress(data.toString());
				if (parsed !== undefined) {
					onProgress(parsed);
				}
			}
		});

		await task;
		onProgress(numberOfFrames);
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
	} catch (err) {
		(rmSync ?? rmdirSync)(filelistDir, {recursive: true});
		throw err;
	}
};
