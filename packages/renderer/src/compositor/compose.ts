import {spawn} from 'child_process';
import {createHash} from 'crypto';
import {copyFile} from 'fs/promises';
import type {DownloadMap} from '../assets/download-map';
import {getExecutablePath} from './get-executable-path';
import type {
	CliInput,
	CompositorImageFormat,
	ErrorPayload,
	Layer,
} from './payloads';

type CompositorInput = {
	height: number;
	width: number;
	layers: Layer[];
	imageFormat: CompositorImageFormat;
};

const getCompositorHash = ({...input}: CompositorInput): string => {
	return createHash('sha256').update(JSON.stringify(input)).digest('base64');
};

export const compose = async ({
	height,
	width,
	layers,
	output,
	downloadMap,
	imageFormat,
}: CompositorInput & {
	downloadMap: DownloadMap;
	output: string;
}) => {
	const bin = getExecutablePath();
	const hash = getCompositorHash({height, width, layers, imageFormat});

	if (downloadMap.compositorCache[hash]) {
		await copyFile(downloadMap.compositorCache[hash], output);
		return;
	}

	const payload: CliInput = {
		v: 1,
		height,
		width,
		layers,
		output,
		output_format: imageFormat,
	};

	await new Promise<void>((resolve, reject) => {
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

	downloadMap.compositorCache[hash] = output;
};
