import {makeStreamer} from '@remotion/streaming';
import {spawn} from 'node:child_process';
import path from 'node:path';
import type {LogLevel} from '../log-level';
import {isEqualOrBelowLogLevel} from '../log-level';
import {Log} from '../logger';
import {getExecutablePath} from './get-executable-path';
import {makeFileExecutableIfItIsNot} from './make-file-executable';
import {makeNonce} from './make-nonce';
import type {
	CompositorCommand,
	CompositorCommandSerialized,
	ErrorPayload,
} from './payloads';
import {serializeCommand} from './serialize-command';

export type Compositor = {
	finishCommands: () => Promise<void>;
	executeCommand: <T extends keyof CompositorCommand>(
		type: T,
		payload: CompositorCommand[T],
	) => Promise<Uint8Array>;
	waitForDone: () => Promise<void>;
	pid: number | null;
};

type Waiter = {
	resolve: (data: Uint8Array) => void;
	reject: (err: Error) => void;
};

export const startLongRunningCompositor = ({
	maximumFrameCacheItemsInBytes,
	logLevel,
	indent,
	binariesDirectory,
	extraThreads,
}: {
	maximumFrameCacheItemsInBytes: number | null;
	logLevel: LogLevel;
	indent: boolean;
	binariesDirectory: string | null;
	extraThreads: number;
}) => {
	return startCompositor({
		type: 'StartLongRunningProcess',
		payload: {
			concurrency: extraThreads,
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

	let stderrChunks: Uint8Array[] = [];

	const waiters = new Map<string, Waiter>();

	const onMessage = (
		statusType: 'success' | 'error',
		nonce: string,
		data: Uint8Array,
	) => {
		// Nonce '0' just means that the message should be logged
		if (nonce === '0') {
			Log.verbose(
				{indent, logLevel, tag: 'compositor'},
				new TextDecoder('utf8').decode(data),
			);
		} else if (waiters.has(nonce)) {
			if (statusType === 'error') {
				try {
					const parsed = JSON.parse(
						new TextDecoder('utf8').decode(data),
					) as ErrorPayload;
					(waiters.get(nonce) as Waiter).reject(
						new Error(`Compositor error: ${parsed.error}\n${parsed.backtrace}`),
					);
				} catch {
					(waiters.get(nonce) as Waiter).reject(
						new Error(new TextDecoder('utf8').decode(data)),
					);
				}
			} else {
				(waiters.get(nonce) as Waiter).resolve(data);
			}

			waiters.delete(nonce);
		}
	};

	const {onData, getOutputBuffer, clear} = makeStreamer(onMessage);

	let runningStatus: RunningStatus = {type: 'running'};

	child.stdout.on('data', onData);

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
				new TextDecoder('utf-8').decode(getOutputBuffer());
			runningStatus = {type: 'quit-with-error', error: errorMessage, signal};

			const error =
				code === null
					? new Error(`Compositor exited with signal ${signal}`)
					: new Error(`Compositor exited with code ${code}: ${errorMessage}`);
			for (const waiter of waitersToKill) {
				waiter.reject(error);
			}

			waiters.clear();

			reject?.(error);
		}

		// Need to manually free up memory
		clear();
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
			return new Promise<Uint8Array>((_resolve, _reject) => {
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
