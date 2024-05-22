import {spawn} from 'node:child_process';
import path from 'node:path';
import {getActualConcurrency} from '../get-concurrency';
import type {LogLevel} from '../log-level';
import {isEqualOrBelowLogLevel} from '../log-level';
import {Log} from '../logger';
import {serializeCommand} from './compose';
import {getExecutablePath} from './get-executable-path';
import {makeFileExecutableIfItIsNot} from './make-file-executable';
import {makeNonce} from './make-nonce';
import type {
	CompositorCommand,
	CompositorCommandSerialized,
	ErrorPayload,
} from './payloads';

export type Compositor = {
	finishCommands: () => Promise<void>;
	executeCommand: <T extends keyof CompositorCommand>(
		type: T,
		payload: CompositorCommand[T],
	) => Promise<Buffer>;
	waitForDone: () => Promise<void>;
	pid: number | null;
};

type Waiter = {
	resolve: (data: Buffer) => void;
	reject: (err: Error) => void;
};

export const startLongRunningCompositor = ({
	maximumFrameCacheItemsInBytes,
	logLevel,
	indent,
	binariesDirectory,
}: {
	maximumFrameCacheItemsInBytes: number | null;
	logLevel: LogLevel;
	indent: boolean;
	binariesDirectory: string | null;
}) => {
	return startCompositor({
		type: 'StartLongRunningProcess',
		payload: {
			concurrency: getActualConcurrency(null),
			maximum_frame_cache_size_in_bytes: maximumFrameCacheItemsInBytes,
			verbose: isEqualOrBelowLogLevel(logLevel, 'verbose'),
		},
		logLevel,
		indent,
		binariesDirectory,
	});
};

type RunningStatus =
	| {
			type: 'running';
	  }
	| {
			type: 'quit-with-error';
			error: string;
			signal: NodeJS.Signals | null;
	  }
	| {
			type: 'quit-without-error';
			signal: NodeJS.Signals | null;
	  };

export const startCompositor = <T extends keyof CompositorCommand>({
	type,
	payload,
	logLevel,
	indent,
	binariesDirectory = null,
}: {
	type: T;
	payload: CompositorCommand[T];
	logLevel: LogLevel;
	indent: boolean;
	binariesDirectory: string | null;
}): Compositor => {
	const bin = getExecutablePath({
		type: 'compositor',
		indent,
		logLevel,
		binariesDirectory,
	});
	makeFileExecutableIfItIsNot(bin);

	const fullCommand: CompositorCommandSerialized<T> = serializeCommand(
		type,
		payload,
	);

	const cwd = path.dirname(bin);

	const child = spawn(bin, [JSON.stringify(fullCommand)], {
		cwd,
		env:
			process.platform === 'darwin'
				? {
						// Should work out of the box, but sometimes it doesn't
						// https://github.com/remotion-dev/remotion/issues/3862
						DYLD_LIBRARY_PATH: cwd,
					}
				: undefined,
	});

	let stderrChunks: Buffer[] = [];
	let outputBuffer = Buffer.from('');

	const separator = Buffer.from('remotion_buffer:');
	const waiters = new Map<string, Waiter>();

	const onMessage = (
		statusType: 'success' | 'error',
		nonce: string,
		data: Buffer,
	) => {
		if (nonce === '0') {
			Log.verbose({indent, logLevel, tag: 'compositor'}, data.toString('utf8'));
		}

		if (waiters.has(nonce)) {
			if (statusType === 'error') {
				try {
					const parsed = JSON.parse(data.toString('utf8')) as ErrorPayload;
					(waiters.get(nonce) as Waiter).reject(
						new Error(`Compositor error: ${parsed.error}\n${parsed.backtrace}`),
					);
				} catch (err) {
					(waiters.get(nonce) as Waiter).reject(
						new Error(data.toString('utf8')),
					);
				}
			} else {
				(waiters.get(nonce) as Waiter).resolve(data);
			}

			waiters.delete(nonce);
		}
	};

	let runningStatus: RunningStatus = {type: 'running'};
	let missingData: null | {
		dataMissing: number;
	} = null;

	const processInput = () => {
		let separatorIndex = outputBuffer.indexOf(separator);
		if (separatorIndex === -1) {
			return;
		}

		separatorIndex += separator.length;

		let nonceString = '';
		let lengthString = '';
		let statusString = '';

		// Each message from Rust is prefixed with `remotion_buffer;{[nonce]}:{[length]}`
		// Let's read the buffer to extract the nonce, and if the full length is available,
		// we'll extract the data and pass it to the callback.

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			// 0x3a is the character ":"
			if (nextDigit === 0x3a) {
				separatorIndex++;
				break;
			}

			separatorIndex++;
			if (separatorIndex > outputBuffer.length) {
				throw new Error('separatorIndex out of bounds: '+ JSON.stringify(outputBuffer));
			}

			nonceString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			if (nextDigit === 0x3a) {
				separatorIndex++;
				break;
			}

			separatorIndex++;
			if (separatorIndex > outputBuffer.length) {
				throw new Error('separatorIndex out of bounds ' + JSON.stringify(outputBuffer));
			}

			lengthString += String.fromCharCode(nextDigit);
		}

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const nextDigit = outputBuffer[separatorIndex];
			if (nextDigit === 0x3a) {
				break;
			}

			separatorIndex++;

			if (separatorIndex > outputBuffer.length) {
				throw new Error('separatorIndex out of bounds ' + JSON.stringify(outputBuffer));
			}

			statusString += String.fromCharCode(nextDigit);
		}

		const length = Number(lengthString);
		const status = Number(statusString);

		const dataLength = outputBuffer.length - separatorIndex - 1;
		if (dataLength < length) {
			missingData = {
				dataMissing: length - dataLength,
			};

			return;
		}

		const data = outputBuffer.subarray(
			separatorIndex + 1,
			separatorIndex + 1 + Number(lengthString),
		);
		onMessage(status === 1 ? 'error' : 'success', nonceString, data);
		missingData = null;

		outputBuffer = outputBuffer.subarray(
			separatorIndex + Number(lengthString) + 1,
		);

		processInput();
	};

	let unprocessedBuffers: Buffer[] = [];

	child.stdout.on('data', (data) => {
		unprocessedBuffers.push(data);
		const separatorIndex = data.indexOf(separator);
		if (separatorIndex === -1) {
			if (missingData) {
				missingData.dataMissing -= data.length;
			}

			if (!missingData || missingData.dataMissing > 0) {
				return;
			}
		}

		unprocessedBuffers.unshift(outputBuffer);

		outputBuffer = Buffer.concat(unprocessedBuffers);

		unprocessedBuffers = [];
		processInput();
	});

	child.stderr.on('data', (data) => {
		stderrChunks.push(data);
	});

	let resolve: ((value: void | PromiseLike<void>) => void) | null = null;
	let reject: ((reason: Error) => void) | null = null;

	child.on('close', (code, signal) => {
		const waitersToKill = Array.from(waiters.values());
		if (code === 0) {
			runningStatus = {type: 'quit-without-error', signal};

			resolve?.();
			for (const waiter of waitersToKill) {
				waiter.reject(
					new Error(`Compositor quit${signal ? ` with signal ${signal}` : ''}`),
				);
			}

			waiters.clear();
		} else {
			const errorMessage =
				Buffer.concat(stderrChunks).toString('utf-8') +
				outputBuffer.toString('utf-8');
			runningStatus = {type: 'quit-with-error', error: errorMessage, signal};

			const error =
				code === null
					? new Error(`Compositor exited with signal ${signal}`)
					: new Error(`Compositor panicked with code ${code}: ${errorMessage}`);
			for (const waiter of waitersToKill) {
				waiter.reject(error);
			}

			waiters.clear();

			reject?.(error);
		}

		// Need to manually free up memory
		outputBuffer = Buffer.from('');
		stderrChunks = [];
	});

	return {
		waitForDone: () => {
			return new Promise<void>((res, rej) => {
				if (runningStatus.type === 'quit-without-error') {
					rej(
						new Error(
							`Compositor quit${
								runningStatus.signal
									? ` with signal ${runningStatus.signal}`
									: ''
							}`,
						),
					);
					return;
				}

				if (runningStatus.type === 'quit-with-error') {
					rej(
						new Error(
							`Compositor quit${
								runningStatus.signal
									? ` with signal ${runningStatus.signal}`
									: ''
							}: ${runningStatus.error}`,
						),
					);
					return;
				}

				resolve = res;
				reject = rej;
			});
		},
		finishCommands: (): Promise<void> => {
			if (runningStatus.type === 'quit-with-error') {
				return Promise.reject(
					new Error(
						`Compositor quit${
							runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''
						}: ${runningStatus.error}`,
					),
				);
			}

			if (runningStatus.type === 'quit-without-error') {
				return Promise.reject(
					new Error(
						`Compositor quit${
							runningStatus.signal ? ` with signal ${runningStatus.signal}` : ''
						}`,
					),
				);
			}

			return new Promise<void>((res, rej) => {
				child.stdin.write('EOF\n', (e) => {
					if (e) {
						rej(e);
						return;
					}

					res();
				});
			});
		},

		executeCommand: <Type extends keyof CompositorCommand>(
			command: Type,
			params: CompositorCommand[Type],
		) => {
			return new Promise<Buffer>((_resolve, _reject) => {
				if (runningStatus.type === 'quit-without-error') {
					_reject(
						new Error(
							`Compositor quit${
								runningStatus.signal
									? ` with signal ${runningStatus.signal}`
									: ''
							}`,
						),
					);
					return;
				}

				if (runningStatus.type === 'quit-with-error') {
					_reject(
						new Error(
							`Compositor quit${
								runningStatus.signal
									? ` with signal ${runningStatus.signal}`
									: ''
							}: ${runningStatus.error}`,
						),
					);
					return;
				}

				const nonce = makeNonce();
				const composed: CompositorCommandSerialized<Type> = {
					nonce,
					payload: {
						type: command,
						params,
					},
				};
				child.stdin.write(JSON.stringify(composed) + '\n', (e) => {
					if (e) {
						_reject(e);
					}
				});
				waiters.set(nonce, {
					resolve: _resolve,
					reject: _reject,
				});
			});
		},
		pid: child.pid ?? null,
	};
};
