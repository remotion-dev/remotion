// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {mkdtempSync, rmdirSync, writeFileSync} from 'fs';
import {join} from 'path';

export const combineVideos = async (files: string[], output: string) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const filelistDir = mkdtempSync('remotion-filelist');
	const fileListTxt = join(filelistDir, 'files.txt');
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
