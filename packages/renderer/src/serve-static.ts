import http from 'http';
import {Internals} from 'remotion';
import handler from 'serve-handler';
import {getDesiredPort} from './get-port';

export const serveStatic = async (
	path: string,
	options?: {
		port?: number;
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

	try {
		const server = http
			.createServer((request, response) => {
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
		console.log({err, msg: err.message});
		if ((err as Error).message.includes('EADDRINUSE')) {
			return serveStatic(path, options);
		}

		throw err;
	}
};
