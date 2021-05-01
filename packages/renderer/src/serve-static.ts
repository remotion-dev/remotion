import http from 'http';
import handler from 'serve-handler';
import {getPort} from './get-port';

export const serveStatic = async (path: string) => {
	const port = await getPort(3000, 3100);

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
	const close = () =>
		new Promise<void>((resolve, reject) => {
			server.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	return {port, close};
};
