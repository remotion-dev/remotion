import http from 'http';
import nodeStatic from 'node-static';
import {getPort} from './get-port';

export const serveStatic = async (path: string) => {
	const port = await getPort(3000, 3100);
	const fileServer = new nodeStatic.Server(path);

	const server = http
		.createServer((request, response) => {
			request
				.addListener('end', () => {
					fileServer.serve(request, response);
				})
				.resume();
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
