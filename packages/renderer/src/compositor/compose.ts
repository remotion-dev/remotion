import {spawn} from 'child_process';
import {getExecutablePath} from './get-executable-path';
import type {CliInput, ErrorPayload, Layer} from './payload';

export const compose = ({
	height,
	width,
	layers,
	output,
}: {
	height: number;
	width: number;
	layers: Layer[];
	output: string;
}) => {
	const bin = getExecutablePath();

	const payload: CliInput = {
		v: 1,
		height,
		width,
		layers,
		output,
	};

	return new Promise<void>((resolve, reject) => {
		const child = spawn(bin);
		child.stdin.write(JSON.stringify(payload));
		child.stdin.end();

		const stderrChunks: Buffer[] = [];
		child.stderr.on('data', (d) => stderrChunks.push(d));

		child.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				const message = Buffer.concat(stderrChunks).toString('utf-8');

				const parsed = JSON.parse(message) as ErrorPayload;

				const err = new Error(parsed.error);
				err.stack = parsed.error + '\n' + parsed.backtrace;

				reject(err);
			}
		});
	});
};
