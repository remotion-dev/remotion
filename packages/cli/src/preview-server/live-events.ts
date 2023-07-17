import type {
	IncomingMessage,
	OutgoingHttpHeaders,
	ServerResponse,
} from 'node:http';
import type {EventSourceEvent} from '../event-source-events';
import {printServerReadyComment} from '../server-ready-comment';
import {unsubscribeClientFileExistenceWatchers} from './file-existence-watchers';

type Client = {
	id: string;
	response: ServerResponse;
};

export type LiveEventsServer = {
	sendEventToClient: (event: EventSourceEvent) => void;
	router: (request: IncomingMessage, response: ServerResponse) => void;
};

const serializeMessage = (message: EventSourceEvent) => {
	return `data: ${JSON.stringify(message)}\n\n`;
};

let printPortMessageTimeout: NodeJS.Timeout | null = null;

export const makeLiveEventsRouter = (): LiveEventsServer => {
	let clients: Client[] = [];

	const router = (request: IncomingMessage, response: ServerResponse) => {
		const headers: OutgoingHttpHeaders = {
			'content-type': 'text/event-stream',
			connection: 'keep-alive',
			'cache-control': 'no-cache',
		};

		response.writeHead(200, headers);
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
					printServerReadyComment('To restart');
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
};
