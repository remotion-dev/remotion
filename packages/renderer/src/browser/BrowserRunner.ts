/**
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as childProcess from 'node:child_process';
import {join} from 'node:path';
import {deleteDirectory} from '../delete-directory';
import type {LogLevel} from '../log-level';
import {isEqualOrBelowLogLevel} from '../log-level';
import {Log} from '../logger';
import {truthy} from '../truthy';
import {Connection} from './Connection';
import {TimeoutError} from './Errors';
import {NodeWebSocketTransport} from './NodeWebSocketTransport';
import {assert} from './assert';
import {
	formatChromeMessage,
	shouldLogBrowserMessage,
} from './should-log-message';
import {
	addEventListener,
	isErrnoException,
	isErrorLike,
	removeEventListeners,
} from './util';

const PROCESS_ERROR_EXPLANATION = `Puppeteer was unable to kill the process which ran the browser binary.
 This means that, on future Puppeteer launches, Puppeteer might not be able to launch the browser.
 Please check your open processes and ensure that the browser processes that Puppeteer launched have been killed.
 If you think this is a bug, please report it on the Puppeteer issue tracker.`;

export const makeBrowserRunner = async ({
	executablePath,
	processArguments,
	userDataDir,
	logLevel,
	indent,
	timeout,
}: {
	executablePath: string;
	processArguments: string[];
	userDataDir: string;
	logLevel: LogLevel;
	indent: boolean;
	timeout: number;
}) => {
	const dumpio = isEqualOrBelowLogLevel(logLevel, 'verbose');
	const stdio: ('ignore' | 'pipe')[] = dumpio
		? ['ignore', 'pipe', 'pipe']
		: ['pipe', 'ignore', 'pipe'];

	const proc = childProcess.spawn(executablePath, processArguments, {
		// On non-windows platforms, `detached: true` makes child process a
		// leader of a new process group, making it possible to kill child
		// process tree with `.kill(-pid)` command. @see
		// https://nodejs.org/api/child_process.html#child_process_options_detached
		detached: process.platform !== 'win32',
		env: process.env,
		stdio,
	});

	const browserWSEndpoint = await waitForWSEndpoint({
		browserProcess: proc,
		timeout,
		indent,
		logLevel,
	});
	const transport = await NodeWebSocketTransport.create(browserWSEndpoint);
	const connection = new Connection(transport);

	const killProcess = (): void => {
		// If the process failed to launch (for example if the browser executable path
		// is invalid), then the process does not get a pid assigned. A call to
		// `proc.kill` would error, as the `pid` to-be-killed can not be found.
		if (proc.pid && pidExists(proc.pid)) {
			try {
				if (process.platform === 'win32') {
					childProcess.exec(`taskkill /pid ${proc.pid} /T /F`, (error) => {
						if (error) {
							// taskkill can fail to kill the process e.g. due to missing permissions.
							// Let's kill the process via Node API. This delays killing of all child
							// processes of `this.proc` until the main Node.js process dies.
							proc.kill();
						}
					});
				} else {
					// on linux the process group can be killed with the group id prefixed with
					// a minus sign. The process group id is the group leader's pid.
					const processGroupId = -proc.pid;

					try {
						process.kill(processGroupId, 'SIGKILL');
					} catch (error) {
						// Killing the process group can fail due e.g. to missing permissions.
						// Let's kill the process via Node API. This delays killing of all child
						// processes of `this.proc` until the main Node.js process dies.
						Log.verbose(
							{indent, logLevel},
							`Could not kill browser process group ${processGroupId}. Killing process via Node.js API`,
						);
						proc.kill('SIGKILL');
					}
				}
			} catch (error) {
				throw new Error(
					`${PROCESS_ERROR_EXPLANATION}\nError cause: ${
						isErrorLike(error) ? error.stack : error
					}`,
				);
			}
		}

		deleteDirectory(userDataDir);

		// Cleanup this listener last, as that makes sure the full callback runs. If we
		// perform this earlier, then the previous function calls would not happen.
		removeEventListeners(listeners);
	};

	const closeProcess = (): Promise<void> => {
		if (closed) {
			return Promise.resolve();
		}

		killProcess();

		deleteDirectory(userDataDir);

		// Cleanup this listener last, as that makes sure the full callback runs. If we
		// perform this earlier, then the previous function calls would not happen.
		removeEventListeners(listeners);
		return processClosing;
	};

	if (dumpio) {
		proc.stdout?.on('data', (d) => {
			const message = d.toString('utf8').trim();
			if (shouldLogBrowserMessage(message)) {
				const formatted = formatChromeMessage(message);
				if (!formatted) {
					return;
				}

				const {output, tag} = formatted;
				Log.verbose({indent, logLevel, tag}, output);
			}
		});
		proc.stderr?.on('data', (d) => {
			const message = d.toString('utf8').trim();
			if (shouldLogBrowserMessage(message)) {
				const formatted = formatChromeMessage(message);
				if (!formatted) {
					return;
				}

				const {output, tag} = formatted;
				Log.error({indent, logLevel, tag}, output);
			}
		});
	}

	let closed = false;
	const processClosing = new Promise<void>((fulfill, reject) => {
		(proc as childProcess.ChildProcess).once('exit', () => {
			closed = true;
			// Cleanup as processes exit.
			try {
				fulfill();
			} catch (error) {
				reject(error);
			}
		});
	});
	const listeners = [addEventListener(process, 'exit', killProcess)];
	listeners.push(
		addEventListener(process, 'SIGINT', () => {
			killProcess();
			process.exit(130);
		}),
	);

	listeners.push(addEventListener(process, 'SIGTERM', closeProcess));
	listeners.push(addEventListener(process, 'SIGHUP', closeProcess));

	const deleteBrowserCaches = () => {
		// We leave some data:
		// Default/Cookies
		// Default/Local Storage
		// Default/Session Storage
		// DevToolsActivePort

		// Because not sure if it is bad to delete them while Chrome is running.
		const cachePaths = [
			join(userDataDir, 'Default', 'Cache', 'Cache_Data'),
			join(userDataDir, 'Default', 'Code Cache'),
			join(userDataDir, 'Default', 'DawnCache'),
			join(userDataDir, 'Default', 'GPUCache'),
		];

		for (const p of cachePaths) {
			deleteDirectory(p);
		}
	};

	const rememberEventLoop = (): void => {
		proc.ref();
		// @ts-expect-error
		proc.stdout?.ref();
		// @ts-expect-error
		proc.stderr?.ref();
		assert(connection, 'BrowserRunner not connected.');
		connection.transport.rememberEventLoop();
	};

	const forgetEventLoop = (): void => {
		proc.unref();
		// @ts-expect-error
		proc.stdout?.unref();
		// @ts-expect-error
		proc.stderr?.unref();
		assert(connection, 'BrowserRunner not connected.');
		connection.transport.forgetEventLoop();
	};

	return {
		listeners,
		deleteBrowserCaches,
		forgetEventLoop,
		rememberEventLoop,
		connection,
		closeProcess,
	};
};

function waitForWSEndpoint({
	browserProcess,
	timeout,
	logLevel,
	indent,
}: {
	browserProcess: childProcess.ChildProcess;
	timeout: number;
	logLevel: LogLevel;
	indent: boolean;
}): Promise<string> {
	const browserStderr = browserProcess.stderr;
	assert(browserStderr, '`browserProcess` does not have stderr.');

	let stderrString = '';

	return new Promise((resolve, reject) => {
		browserStderr.addListener('data', onData);
		browserStderr.addListener('close', onClose);
		const listeners = [
			() => browserStderr.removeListener('data', onData),
			() => browserStderr.removeListener('close', onClose),
			addEventListener(browserProcess, 'exit', (code, signal) => {
				Log.verbose(
					{indent, logLevel},
					'Browser process exited with code',
					code,
					'signal',
					signal,
				);
				return onClose(new Error(`Closed with ${code} signal: ${signal}`));
			}),
			addEventListener(browserProcess, 'error', (error) => {
				return onClose(error);
			}),
		];
		const timeoutId = timeout ? setTimeout(onTimeout, timeout) : 0;

		function onClose(error?: Error) {
			cleanup();
			reject(
				new Error(
					[
						'Failed to launch the browser process!',
						error ? error.stack : null,
						stderrString,
						'Troubleshooting: https://remotion.dev/docs/troubleshooting/browser-launch',
					]
						.filter(truthy)
						.join('\n'),
				),
			);
		}

		function onTimeout() {
			cleanup();
			reject(
				new TimeoutError(
					`Timed out after ${timeout} ms while trying to connect to the browser! Chrome logged the following: ${stderrString}`,
				),
			);
		}

		function onData(data: Buffer) {
			stderrString += data.toString('utf8');
			const match = stderrString.match(/DevTools listening on (ws:\/\/.*)/);
			if (!match) {
				return;
			}

			cleanup();
			resolve(match[1]);
		}

		function cleanup(): void {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			removeEventListeners(listeners);
		}
	});
}

function pidExists(pid: number): boolean {
	try {
		return process.kill(pid, 0);
	} catch (error) {
		if (isErrnoException(error)) {
			if (error.code && error.code === 'ESRCH') {
				return false;
			}
		}

		throw error;
	}
}

export type BrowserRunner = Awaited<ReturnType<typeof makeBrowserRunner>>;
