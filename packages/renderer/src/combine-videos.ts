// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {rmdirSync, writeFileSync} from 'fs';
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
	console.log(fileList, 'file list');
	writeFileSync(fileListTxt, fileList);

	try {
		const task = execa('ffmpeg', [
			'-f',
			'concat',
			'-safe',
			'0',
			'-i',
			fileListTxt,
			'-c',
			'copy',
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
		rmdirSync(filelistDir, {recursive: true});
	} catch (err) {
		rmdirSync(filelistDir, {recursive: true});
		throw err;
	}
};
