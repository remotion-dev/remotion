import type {LogLevel} from '@remotion/renderer';
import type {EventSourceEvent} from '@remotion/studio-shared';
import type {
	IncomingMessage,
	OutgoingHttpHeaders,
	ServerResponse,
} from 'node:http';
import {printServerReadyComment} from '../server-ready';
import {unsubscribeClientFileExistenceWatchers} from './file-existence-watchers';

type Client = {
	id: string;
	response: ServerResponse;
};

export type LiveEventsServer = {
	sendEventToClient: (event: EventSourceEvent) => void;
	router: (request: IncomingMessage, response: ServerResponse) => void;
	closeConnections: () => Promise<void>;
};

const serializeMessage = (message: EventSourceEvent) => {
	return `data: ${JSON.stringify(message)}\n\n`;
};

let printPortMessageTimeout: Timer | null = null;

export const makeLiveEventsRouter = (logLevel: LogLevel): LiveEventsServer => {
	let clients: Client[] = [];

	const router = (request: IncomingMessage, response: ServerResponse) => {
		const headers: OutgoingHttpHeaders = {
			'content-type': 'text/event-stream;charset=utf-8',
			connection: 'keep-alive',
			'cache-control': 'no-cache',
		};

		response.writeHead(200, headers);
		response.write('\n');
		if (request.method === 'OPTIONS') {
			response.end();
			return;
		}

		const clientId = String(Math.random());
		response.write(serializeMessage({type: 'init', clientId}));

		const newClient = {
			id: clientId,
			response,
		};
		clients.push(newClient);
		if (printPortMessageTimeout) {
			clearTimeout(printPortMessageTimeout);
		}

		request.on('close', () => {
			unsubscribeClientFileExistenceWatchers(clientId);
			clients = clients.filter((client) => client.id !== clientId);

			// If all clients disconnected, print a comment so user can easily restart it.
			if (clients.length === 0) {
				if (printPortMessageTimeout) {
					clearTimeout(printPortMessageTimeout);
				}

				printPortMessageTimeout = setTimeout(() => {
					printServerReadyComment('To restart', logLevel);
				}, 2500);
			}
		});
	};

	const sendEventToClient = (event: EventSourceEvent) => {
		clients.forEach((client) => {
			client.response.write(serializeMessage(event));
		});
	};

	return {
		sendEventToClient,
		router,
		closeConnections: () => {
			return Promise.all(
				clients.map((client) => {
					return new Promise<void>((resolve) => {
						client.response.end(() => {
							resolve();
						});
					});
				}),
			).then(() => undefined);
		},
	};
};

type Waiter = (list: LiveEventsServer) => void;
let liveEventsListener: LiveEventsServer | null = null;

const waiters: Waiter[] = [];

export const waitForLiveEventsListener = (): Promise<LiveEventsServer> => {
	if (liveEventsListener) {
		return Promise.resolve(liveEventsListener);
	}

	return new Promise<LiveEventsServer>((resolve) => {
		waiters.push((list: LiveEventsServer) => {
			resolve(list);
		});
	});
};

export const setLiveEventsListener = (listener: LiveEventsServer) => {
	liveEventsListener = listener;
	waiters.forEach((w) => w(listener));
	return () => {
		liveEventsListener = null;
	};
};
