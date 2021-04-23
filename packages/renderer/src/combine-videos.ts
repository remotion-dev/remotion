// Combine multiple video chunks, useful for decentralized rendering

import execa from 'execa';
import {mkdtempSync, unlinkSync, writeFileSync} from 'fs';
import {join} from 'path';

export const combineVideos = async (files: string[], output: string) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(mkdtempSync('remotion-filelist'), 'files.txt');
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
			output,
		]);
		unlinkSync(fileListTxt);
	} catch (err) {
		unlinkSync(fileListTxt);
		throw err;
	}
};
