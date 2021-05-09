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

const isPortAvailable = async (port: number) => {
	try {
		await getAvailablePort(port);

		return true;
	} catch (error) {
		if (!['EADDRINUSE', 'EACCES'].includes(error.code)) {
			throw error;
		}

		return false;
	}
};

const getPort = async (from: number, to: number) => {
	const ports = makeRange(from, to);

	for (const port of portCheckSequence(ports)) {
		if (await isPortAvailable(port)) {
			return port;
		}
	}

	throw new Error('No available ports found');
};

export const getDesiredPort = async (
	desiredPort: number | undefined,
	from: number,
	to: number
) => {
	if (
		typeof desiredPort !== 'undefined' &&
		(await isPortAvailable(desiredPort))
	) {
		return desiredPort;
	}

	const actualPort = await getPort(from, to);

	// If did specify a port but did not get that one, fail hard.
	if (desiredPort && desiredPort !== actualPort) {
		throw new Error(
			`You specified port ${desiredPort} to be used for the HTTP server, but it is not available. Choose a different port or remove the setting to let Remotion automatically select a free port.`
		);
	}

	return actualPort;
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
