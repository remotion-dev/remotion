// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {rmdirSync, writeFileSync} from 'fs';
import {join} from 'path';

export const combineVideos = async ({
	files,
	filelistDir,
	output,
}: {
	files: string[];
	filelistDir: string;
	output: string;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'files.txt');
	console.log(fileList, 'file list');
	writeFileSync(fileListTxt, fileList);

	try {
		await execa('ffmpeg', [
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
		rmdirSync(filelistDir, {recursive: true});
	} catch (err) {
		rmdirSync(filelistDir, {recursive: true});
		throw err;
	}
};
