import {createServer} from 'net';

export const isPortOpen = (port: number): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		const server = createServer();

		server.once('error', (err: Error & {code: string}) => {
			if (err.code === 'EADDRINUSE') {
				resolve(false);
			} else {
				reject(err);
			}
		});

		server.once('listening', () => {
			server.close(() => {
				resolve(true);
			});
		});

		server.listen(port);
	});
};
