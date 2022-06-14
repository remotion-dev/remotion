import http from 'http';
import {FfmpegExecutable, Internals} from 'remotion';
import {AddRenderCleanupFunction} from './assets/cleanup-assets';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {getDesiredPort} from './get-port';
import {startOffthreadVideoServer} from './offthread-video-server';
import {serveHandler} from './serve-handler';

export const serveStatic = async (
	path: string | null,
	options: {
		port: number | null;
		ffmpegExecutable: FfmpegExecutable;
		ffprobeExecutable: FfmpegExecutable;
		downloadDir: string;
		onDownload: RenderMediaOnDownload;
		onError: (err: Error) => void;
		addCleanupFunction: AddRenderCleanupFunction;
	}
): Promise<{
	port: number;
	close: () => Promise<void>;
}> => {
	const port = await getDesiredPort(
		options?.port ?? Internals.getServerPort() ?? undefined,
		3000,
		3100
	);

	const offthreadRequest = startOffthreadVideoServer({
		ffmpegExecutable: options.ffmpegExecutable,
		ffprobeExecutable: options.ffprobeExecutable,
		downloadDir: options.downloadDir,
		onDownload: options.onDownload,
		onError: options.onError,
		addCleanupFunction: options.addCleanupFunction,
	});

	try {
		const server = http
			.createServer((request, response) => {
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
					response.statusCode = 500;
					response.end('Error serving file');
				});
			})
			.listen(port);

		const close = () => {
			return new Promise<void>((resolve, reject) => {
				server.close((err) => {
					if (err) {
						if (
							(err as Error & {code: string}).code === 'ERR_SERVER_NOT_RUNNING'
						) {
							return resolve();
						}

						reject(err);
					} else {
						resolve();
					}
				});
			});
		};

		return {port, close};
	} catch (err) {
		console.log({err, msg: (err as Error).message});
		if ((err as Error).message.includes('EADDRINUSE')) {
			return serveStatic(path, options);
		}

		throw err;
	}
};
