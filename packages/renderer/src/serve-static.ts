import type {Socket} from 'net';
import http from 'node:http';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {getDesiredPort} from './get-port';
import type {LogLevel} from './log-level';
import {startOffthreadVideoServer} from './offthread-video-server';
import {getPortConfig} from './port-config';
import {serveHandler} from './serve-handler';

export const serveStatic = async (
	path: string | null,
	options: {
		port: number | null;
		downloadMap: DownloadMap;
		remotionRoot: string;
		offthreadVideoThreads: number;
		logLevel: LogLevel;
		indent: boolean;
		offthreadVideoCacheSizeInBytes: number | null;
		binariesDirectory: string | null;
		forceIPv4: boolean;
	},
): Promise<{
	port: number;
	close: () => Promise<void>;
	compositor: Compositor;
}> => {
	const {
		listener: offthreadRequest,
		close: closeCompositor,
		compositor,
	} = startOffthreadVideoServer({
		downloadMap: options.downloadMap,
		offthreadVideoThreads: options.offthreadVideoThreads,
		logLevel: options.logLevel,
		indent: options.indent,
		offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
		binariesDirectory: options.binariesDirectory,
	});

	const connections: Record<string, Socket> = {};

	const server = http.createServer((request, response) => {
		if (request.url?.startsWith('/proxy')) {
			return offthreadRequest(request, response);
		}

		if (path === null) {
			response.writeHead(404);
			response.end('Server only supports /proxy');
			return;
		}

		serveHandler(request, response, {
			public: path,
		}).catch(() => {
			if (!response.headersSent) {
				response.writeHead(500);
			}

			response.end('Error serving file');
		});
	});

	server.on('connection', (conn) => {
		let key;
		// Bun 1.0.43 fails on this
		try {
			key = conn.remoteAddress + ':' + conn.remotePort;
		} catch {
			key = ':';
		}

		connections[key] = conn;
		conn.on('close', () => {
			delete connections[key];
		});
	});

	let selectedPort: number | null = null;

	const maxTries = 10;

	const portConfig = getPortConfig(options.forceIPv4);

	for (let i = 0; i < maxTries; i++) {
		let unlock = () => {};
		try {
			selectedPort = await new Promise<number>((resolve, reject) => {
				getDesiredPort({
					desiredPort: options?.port ?? undefined,
					from: 3000,
					to: 3100,
					hostsToTry: portConfig.hostsToTry,
				})
					.then(({port, unlockPort}) => {
						unlock = unlockPort;
						server.listen({port, host: portConfig.host});
						server.on('listening', () => {
							resolve(port);
							return unlock();
						});
						server.on('error', (err) => {
							unlock();
							reject(err);
						});
					})
					.catch((err) => {
						unlock();
						return reject(err);
					});
			});
			const destroyConnections = function () {
				for (const key in connections) connections[key].destroy();
			};

			const close = async () => {
				await Promise.all([
					new Promise<void>((resolve, reject) => {
						// compositor may have already quit before,
						// this is okay as we are in cleanup phase
						closeCompositor()
							.catch((err) => {
								if ((err as Error).message.includes('Compositor quit')) {
									resolve();
									return;
								}

								reject(err);
							})
							.finally(() => {
								resolve();
							});
					}),
					new Promise<void>((resolve, reject) => {
						destroyConnections();
						server.close((err) => {
							if (err) {
								if (
									(err as Error & {code: string}).code ===
									'ERR_SERVER_NOT_RUNNING'
								) {
									return resolve();
								}

								reject(err);
							} else {
								resolve();
							}
						});
					}),
				]);
			};

			return {port: selectedPort, close, compositor};
		} catch (err) {
			if (!(err instanceof Error)) {
				throw err;
			}

			const codedError = err as Error & {code: string; port: number};

			if (codedError.code === 'EADDRINUSE') {
				// Already in use, try another port
			} else {
				throw err;
			}
		}
	}

	throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};
