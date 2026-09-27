import {createServer} from 'node:net';

void (async () => {
	for (let port = 3000; port <= 65535; port++) {
		const available = await new Promise<boolean>((resolve, reject) => {
			const server = createServer();
			server.once('error', (error: NodeJS.ErrnoException) => {
				if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
					resolve(false);
				} else {
					reject(error);
				}
			});
			server.listen(port, '0.0.0.0', () => {
				server.close((error) => {
					if (error) {
						reject(error);
					} else {
						resolve(true);
					}
				});
			});
		});

		if (available) {
			console.log(port);
			return;
		}
	}

	throw new Error('Could not find an available port for the docs server.');
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
