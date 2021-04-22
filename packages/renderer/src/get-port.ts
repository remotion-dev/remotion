import net from 'net';

const getAvailablePort = (portToTry: number) =>
	new Promise<number>((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on('error', reject);
		server.listen({port: portToTry}, () => {
			const {port} = server.address() as net.AddressInfo;
			server.close(() => {
				resolve(port);
			});
		});
	});

const portCheckSequence = function* (ports: Generator<number, void, unknown>) {
	if (ports) {
		yield* ports;
	}

	yield 0; // Fall back to 0 if anything else failed
};

export const getPort = async (from: number, to: number) => {
	const ports = makeRange(from, to);

	for (const port of portCheckSequence(ports)) {
		try {
			const availablePort = await getAvailablePort(port);

			return availablePort;
		} catch (error) {
			if (!['EADDRINUSE', 'EACCES'].includes(error.code)) {
				throw error;
			}
		}
	}

	throw new Error('No available ports found');
};

const makeRange = (from: number, to: number) => {
	if (!Number.isInteger(from) || !Number.isInteger(to)) {
		throw new TypeError('`from` and `to` must be integer numbers');
	}

	if (from < 1024 || from > 65535) {
		throw new RangeError('`from` must be between 1024 and 65535');
	}

	if (to < 1024 || to > 65536) {
		throw new RangeError('`to` must be between 1024 and 65536');
	}

	if (to < from) {
		throw new RangeError('`to` must be greater than or equal to `from`');
	}

	const generator = function* (f: number, t: number) {
		for (let port = f; port <= t; port++) {
			yield port;
		}
	};

	return generator(from, to);
};
