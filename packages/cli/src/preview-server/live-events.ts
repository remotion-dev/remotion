import type {IncomingMessage, OutgoingHttpHeaders, ServerResponse} from 'http';
import type {EventSourceEvent} from '../event-source-events';

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

		response.write(serializeMessage({type: 'init'}));

		const clientId = String(Math.random());

		const newClient = {
			id: clientId,
			response,
		};
		clients.push(newClient);

		request.on('close', () => {
			clients = clients.filter((client) => client.id !== clientId);
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
