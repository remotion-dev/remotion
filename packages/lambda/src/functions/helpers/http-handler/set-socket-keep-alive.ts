import type {ClientRequest} from 'http';

export interface SocketKeepAliveOptions {
	keepAlive: boolean;
	keepAliveMsecs?: number;
}

export const setSocketKeepAlive = (
	request: ClientRequest,
	{keepAlive, keepAliveMsecs}: SocketKeepAliveOptions,
) => {
	if (keepAlive !== true) {
		return;
	}

	request.on('socket', (socket) => {
		socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
	});
};
