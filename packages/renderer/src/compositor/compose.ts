import {spawn} from 'node:child_process';
import path from 'node:path';
import type {LogLevel} from '../log-level';
import {getExecutablePath} from './get-executable-path';
import {makeFileExecutableIfItIsNot} from './make-file-executable';
import {makeNonce} from './make-nonce';
import type {
	CompositorCommand,
	CompositorCommandSerialized,
	ErrorPayload,
} from './payloads';

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
				} catch {
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
