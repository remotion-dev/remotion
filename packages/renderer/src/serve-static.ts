import http from 'http';
import {FfmpegExecutable, Internals} from 'remotion';
import handler from 'serve-handler';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {getDesiredPort} from './get-port';
import {startOffthreadVideoServer} from './offthread-video-server';

export const serveStatic = async (
	path: string | null,
	options: {
		port: number | null;
		ffmpegExecutable: FfmpegExecutable;
		downloadDir: string;
		onDownload: RenderMediaOnDownload;
		onError: (err: Error) => void;
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
		downloadDir: options.downloadDir,
		onDownload: options.onDownload,
		onError: options.onError,
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

				handler(request, response, {
					public: path,
					directoryListing: false,
					cleanUrls: false,
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
