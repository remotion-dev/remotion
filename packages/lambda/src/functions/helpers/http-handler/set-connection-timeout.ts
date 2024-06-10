import type {ClientRequest} from 'http';
import type {Socket} from 'net';

export const setConnectionTimeout = (
	request: ClientRequest,
	reject: (err: Error) => void,
	timeoutInMs = 0,
) => {
	if (!timeoutInMs) {
		return;
	}

	// Throw a connecting timeout error unless a connection is made within time.
	const timeoutId = setTimeout(() => {
		request.destroy();
		reject(
			Object.assign(
				new Error(
					`Socket timed out without establishing a connection within ${timeoutInMs} ms`,
				),
				{
					name: 'TimeoutError',
				},
			),
		);
	}, timeoutInMs);

	request.on('socket', (socket: Socket) => {
		if (socket.connecting) {
			socket.on('connect', () => {
				clearTimeout(timeoutId);
			});
		} else {
			clearTimeout(timeoutId);
		}
	});
};
