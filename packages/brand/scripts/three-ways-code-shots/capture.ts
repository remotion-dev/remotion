import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {captureCode} from '../capture-code';

const output = path.resolve(process.argv[2] ?? '/tmp/three-ways-code');
await mkdir(output, {recursive: true});
await captureCode(
	['content', 'editing', 'captions', 'exporting', 'settings'].map((shot) => ({
		url: `http://127.0.0.1:3041/?shot=${shot}`,
		output: path.join(output, `${shot}.png`),
		width: 640,
		height: 1080,
	})),
);
