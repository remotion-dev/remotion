import net from 'net';
import {createLock} from './locks';

type PortStatus = 'available' | 'unavailable';

const isPortAvailableOnHost = ({
	portToTry,
	host,
}: {
	portToTry: number;
	host: string;
}): Promise<PortStatus> => {
	return new Promise<PortStatus>((resolve) => {
		let status: PortStatus = 'unavailable';

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
};

export const testPortAvailableOnMultipleHosts = async ({
	hosts,
	port,
}: {
	port: number;
	hosts: string[];
}): Promise<PortStatus> => {
	const results = await Promise.all(
		hosts.map((host) => {
			return isPortAvailableOnHost({portToTry: port, host});
		}),
	);

	return results.every((r) => r === 'available') ? 'available' : 'unavailable';
};

const getPort = async ({
	from,
	to,
	hostsToTest,
	onPortUnavailable,
}: {
	from: number;
	to: number;
	hostsToTest: string[];
	onPortUnavailable?: (port: number) => Promise<'continue' | 'stop'>;
}): Promise<{port: number; didUsePort: boolean}> => {
	const ports = makeRange(from, to);

	for (const port of ports) {
		if (
			(await testPortAvailableOnMultipleHosts({
				port,
				hosts: hostsToTest,
			})) === 'available'
		) {
			return {port, didUsePort: false};
		}

		if (onPortUnavailable) {
			const action = await onPortUnavailable(port);
			if (action === 'stop') {
				return {port, didUsePort: true};
			}
		}
	}

	throw new Error('No available ports found');
};

const portLocks = createLock({timeout: 10000});

export const getDesiredPort = async ({
	desiredPort,
	from,
	hostsToTry,
	to,
	onPortUnavailable,
}: {
	desiredPort: number | undefined;
	from: number;
	to: number;
	hostsToTry: string[];
	onPortUnavailable?: (port: number) => Promise<'continue' | 'stop'>;
}) => {
	await portLocks.waitForAllToBeDone();
	const lockPortSelection = portLocks.lock();
	const unlockPort = () => portLocks.unlock(lockPortSelection);

	if (
		typeof desiredPort !== 'undefined' &&
		(await testPortAvailableOnMultipleHosts({
			port: desiredPort,
			hosts: hostsToTry,
		})) === 'available'
	) {
		return {port: desiredPort, unlockPort, didUsePort: false as const};
	}

	if (typeof desiredPort !== 'undefined' && onPortUnavailable) {
		const action = await onPortUnavailable(desiredPort);
		if (action === 'stop') {
			return {port: desiredPort, unlockPort, didUsePort: true as const};
		}
	}

	const result = await getPort({
		from,
		to,
		hostsToTest: hostsToTry,
		onPortUnavailable,
	});

	if (result.didUsePort) {
		return {port: result.port, unlockPort, didUsePort: true as const};
	}

	// If did specify a port but did not get that one, fail hard.
	if (desiredPort && desiredPort !== result.port) {
		unlockPort();
		throw new Error(
			`You specified port ${desiredPort} to be used for the HTTP server, but it is not available. Choose a different port or remove the setting to let Remotion automatically select a free port.`,
		);
	}

	return {port: result.port, unlockPort, didUsePort: false as const};
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
