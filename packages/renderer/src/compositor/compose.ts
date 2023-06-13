import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chmodSync} from 'node:fs';
import {copyFile} from 'node:fs/promises';
import type {DownloadMap} from '../assets/download-map';
import {dynamicLibraryPathOptions} from '../call-ffmpeg';
import type {Compositor} from './compositor';
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

type ComposeInput = CompositorInput & {
	output: string;
	compositor: Compositor;
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

export const composeWithoutCache = async ({
	height,
	width,
	layers,
	output,
	imageFormat,
	compositor,
}: CompositorInput & {
	output: string;
	compositor: Compositor;
}) => {
	await compositor.executeCommand('Compose', {
		height,
		width,
		layers,
		output,
		output_format: imageFormat,
	});
};

export const compose = async ({
	height,
	width,
	layers,
	output,
	downloadMap,
	imageFormat,
	compositor,
}: ComposeInput & {
	downloadMap: DownloadMap;
}) => {
	const hash = getCompositorHash({height, width, layers, imageFormat});

	if (downloadMap.compositorCache[hash]) {
		await copyFile(downloadMap.compositorCache[hash], output);
		return;
	}

	await composeWithoutCache({
		compositor,
		height,
		imageFormat,
		layers,
		output,
		width,
	});

	downloadMap.compositorCache[hash] = output;
};

export const callCompositor = (payload: string) => {
	return new Promise<void>((resolve, reject) => {
		const execPath = getExecutablePath('compositor');
		if (!process.env.READ_ONLY_FS) {
			chmodSync(execPath, 0o755);
		}

		const child = spawn(execPath, [payload], dynamicLibraryPathOptions());

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
					const msg = `Compositor error: ${parsed.error}`;
					const err = new Error(`${msg}\n${parsed.backtrace}`);

					reject(err);
				} catch (err) {
					reject(new Error(`Compositor panicked: ${message}`));
				}
			}
		});

		child.stdin.write(payload);
		child.stdin.end();
	});
};
