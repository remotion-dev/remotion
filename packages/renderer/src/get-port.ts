import net from 'net';
import {pLimit} from './p-limit';

const getAvailablePort = (portToTry: number) =>
	new Promise<'available' | 'unavailable'>((resolve) => {
		let status: 'available' | 'unavailable' = 'unavailable';

		const host = '127.0.0.1';
		const socket = new net.Socket();

		socket.on('connect', () => {
			status = 'unavailable';
			socket.destroy();
		});

		socket.setTimeout(3000);
		socket.on('timeout', () => {
			status = 'unavailable';
			socket.destroy();
			resolve(status);
		});

		socket.on('error', () => {
			status = 'available';
		});

		socket.on('close', () => resolve(status));

		socket.connect(portToTry, host);
	});

const getPort = async (from: number, to: number) => {
	const ports = makeRange(from, to);

	for (const port of ports) {
		if ((await getAvailablePort(port)) === 'available') {
			return port;
		}
	}

	throw new Error('No available ports found');
};

const getDesiredPortUnlimited = async (
	desiredPort: number | undefined,
	from: number,
	to: number
) => {
	if (
		typeof desiredPort !== 'undefined' &&
		(await getAvailablePort(desiredPort)) === 'available'
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

const limit = pLimit(1);
export const getDesiredPort = (
	desiredPort: number | undefined,
	from: number,
	to: number
) => {
	return limit(() => getDesiredPortUnlimited(desiredPort, from, to));
};

const makeRange = (from: number, to: number): number[] => {
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

	return new Array(to - from + 1).fill(true).map((_, i) => {
		return i + from;
	});
};
