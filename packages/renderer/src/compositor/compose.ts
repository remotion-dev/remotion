import {spawn} from 'child_process';
import {createHash} from 'crypto';
import {copyFile} from 'fs/promises';
import type {DownloadMap} from '../assets/download-map';
import {dynamicLibraryPathOptions} from '../call-ffmpeg';
import {getExecutablePath} from './get-executable-path';
import {makeNonce} from './make-nonce';
import type {
	CompositorCommand,
	CompositorCommandSerialized,
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

export const serializeCommand = <Type extends keyof CompositorCommand>(
	command: Type,
	params: CompositorCommand[Type]
): CompositorCommandSerialized<Type> => {
	return {
		nonce: makeNonce(),
		payload: {
			type: command,
			params,
		},
	};
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
	const hash = getCompositorHash({height, width, layers, imageFormat});

	if (downloadMap.compositorCache[hash]) {
		await copyFile(downloadMap.compositorCache[hash], output);
		return;
	}

	const payload = serializeCommand('Compose', {
		height,
		width,
		layers,
		output,
		output_format: imageFormat,
	});

	await callCompositor(JSON.stringify(payload));

	downloadMap.compositorCache[hash] = output;
};

export const callCompositor = (payload: string) => {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(
			getExecutablePath('compositor'),
			[payload],
			dynamicLibraryPathOptions()
		);
		child.stdin.write(payload);
		child.stdin.end();

		const stderrChunks: Buffer[] = [];
		child.stderr.on('data', (d) => stderrChunks.push(d));

		child.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				const message = Buffer.concat(stderrChunks).toString('utf-8');

				try {
					// Try to see if the error is a JSON
					const parsed = JSON.parse(message) as ErrorPayload;
					console.log({parsed});
					const msg = `Compositor error: ${parsed.error}`;
					const err = new Error(`${msg}\n${parsed.backtrace}`);

					reject(err);
				} catch (err) {
					reject(new Error(`Compositor panicked: ${message}`));
				}
			}
		});
	});
};
