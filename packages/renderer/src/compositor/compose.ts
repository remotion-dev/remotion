import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile} from 'node:fs/promises';
import path from 'node:path';
import type {DownloadMap} from '../assets/download-map';
import type {LogLevel} from '../log-level';
import type {Compositor} from './compositor';
import {getExecutablePath} from './get-executable-path';
import {makeFileExecutableIfItIsNot} from './make-file-executable';
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
	params: CompositorCommand[Type],
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

export const callCompositor = (
	payload: string,
	indent: boolean,
	logLevel: LogLevel,
	binariesDirectory: string | null,
) => {
	return new Promise<void>((resolve, reject) => {
		const execPath = getExecutablePath({
			type: 'compositor',
			indent,
			logLevel,
			binariesDirectory,
		});
		makeFileExecutableIfItIsNot(execPath);

		const child = spawn(execPath, [payload], {
			cwd: path.dirname(execPath),
		});

		const stderrChunks: Uint8Array[] = [];
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
					reject(
						new Error(`Compositor panicked with code ${code}: ${message}`),
					);
				}
			}
		});

		if (child.stdin.closed) {
			reject(
				new Error(
					'Compositor stdin closed unexpectedly,' +
						Buffer.concat(stderrChunks).toString('utf-8'),
				),
			);
			return;
		}

		try {
			child.stdin.write(payload, (e) => {
				if (e) {
					if (e instanceof Error && e.message.includes('EPIPE')) {
						reject(
							new Error(
								'Compositor stdin closed unexpectedly,' +
									Buffer.concat(stderrChunks).toString('utf-8'),
							),
						);
					}

					return;
				}

				child.stdin.end();
			});
		} catch (err) {
			if (err instanceof Error && err.message.includes('EPIPE')) {
				reject(
					new Error(
						'Compositor stdin closed unexpectedly,' +
							Buffer.concat(stderrChunks).toString('utf-8'),
					),
				);
			}
		}
	});
};
