import {spawn} from 'child_process';
import {dynamicLibraryPathOptions} from '../call-ffmpeg';
import {getExecutablePath} from './get-executable-path';
import type {CliInputCommand} from './payloads';
export const extractFrameFromVideoCompositor = () => {
	return new Promise<void>((resolve, reject) => {
		const bin = getExecutablePath('compositor');
		const payload: CliInputCommand = {
			type: 'ExtractFrame',
			params: {
				input: '/Users/jonathanburger/Downloads/2013.mp4',
				output:
					'/Users/jonathanburger/remotion/packages/renderer/src/compositor/out.bmp',
				time: 2.5,
			},
		};
		const child = spawn(bin, {...dynamicLibraryPathOptions()});
		child.stdin.write(JSON.stringify(payload));
		child.stdin.end();
		const stderrChunks: Buffer[] = [];
		child.stdout.on('data', (d) => console.log(d.toString()));
		child.stderr.on('data', (d) => stderrChunks.push(d));
		child.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(Buffer.concat(stderrChunks).toString()));
			}
		});
	});
};
