import type {
	IncomingMessage,
	OutgoingHttpHeaders,
	ServerResponse,
} from 'node:http';
import type {LogLevel} from '@remotion/renderer';
import type {
	EventSourceEvent,
	GetAppInfoResponse,
} from '@remotion/studio-shared';
import {printServerReadyComment} from '../server-ready';
import {unsubscribeClientDefaultPropsWatchers} from './default-props-watchers';
import {unsubscribeClientFileExistenceWatchers} from './file-existence-watchers';
import {unsubscribeClientSequencePropsWatchers} from './sequence-props-watchers';

type Client = {
	id: string;
	response: ServerResponse;
};

export type LiveEventsServer = {
	sendEventToClient: (event: EventSourceEvent) => void;
	sendEventToClientId: (clientId: string, event: EventSourceEvent) => boolean;
	router: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
	closeConnections: () => Promise<void>;
	addNewClientListener: (cb: () => void) => () => void;
};

const serializeMessage = (message: EventSourceEvent) => {
	return `data: ${JSON.stringify(message)}\n\n`;
};

let printPortMessageTimeout: Timer | null = null;
const configChangeListeners = new Set<() => void>();

export const subscribeToConfigChanges = (
	onChange: () => void,
): (() => void) => {
	configChangeListeners.add(onChange);
	return () => {
		configChangeListeners.delete(onChange);
	};
};

export const clearPrintPortMessageTimeout = () => {
	if (printPortMessageTimeout) {
		clearTimeout(printPortMessageTimeout);
		printPortMessageTimeout = null;
	}
};

export type InitialUndoRedoState = {
	undoFile: string | null;
	redoFile: string | null;
};

export const makeLiveEventsRouter = (
	logLevel: LogLevel,
	getInitialUndoRedoState: () => InitialUndoRedoState,
	getAppInfo: () => Promise<GetAppInfoResponse>,
): LiveEventsServer => {
	let clients: Client[] = [];
	let newClientListeners: (() => void)[] = [];
	let latestAppInfoMessage: string | null = null;
	let appInfoTimeout: Timer | null = null;
	let refreshingAppInfo = false;
	let appInfoRefreshRequested = false;
	let closed = false;

	const refreshAppInfo = () => {
		if (closed || clients.length === 0) {
			return;
		}

		if (refreshingAppInfo) {
			appInfoRefreshRequested = true;
			return;
		}

		refreshingAppInfo = true;
		appInfoRefreshRequested = false;
		if (appInfoTimeout !== null) {
			clearTimeout(appInfoTimeout);
			appInfoTimeout = null;
		}

		getAppInfo()
			.then((appInfo): EventSourceEvent => ({type: 'app-info', appInfo}))
			.catch(
				(err): EventSourceEvent => ({
					type: 'app-info-error',
					error: (err as Error).message,
				}),
			)
			.then((event) => {
				if (closed || clients.length === 0) {
					return;
				}

				const message = serializeMessage(event);
				if (latestAppInfoMessage === message) {
					return;
				}

				latestAppInfoMessage = message;
				clients.forEach((client) => client.response.write(message));
			})
			.finally(() => {
				refreshingAppInfo = false;
				if (appInfoRefreshRequested) {
					refreshAppInfo();
				} else if (!closed && clients.length > 0) {
					// Process changes have no portable Node.js notification API. Share
					// one scan across all clients and only push changed snapshots.
					appInfoTimeout = setTimeout(refreshAppInfo, 5000);
				}
			});
	};

	const router = (
		request: IncomingMessage,
		response: ServerResponse,
	): Promise<void> => {
		if (closed) {
			response.writeHead(503);
			response.end();
			return Promise.resolve();
		}

		const headers: OutgoingHttpHeaders = {
			'content-type': 'text/event-stream;charset=utf-8',
			connection: 'keep-alive',
			'cache-control': 'no-cache',
		};

		response.writeHead(200, headers);
		response.write('\n');
		if (request.method === 'OPTIONS') {
			response.end();
			return Promise.resolve();
		}

		const clientId = String(Math.random());
		const {undoFile, redoFile} = getInitialUndoRedoState();
		response.write(
			serializeMessage({type: 'init', clientId, undoFile, redoFile}),
		);

		const newClient = {
			id: clientId,
			response,
		};
		clients.push(newClient);
		if (latestAppInfoMessage !== null) {
			response.write(latestAppInfoMessage);
		}

		refreshAppInfo();
		newClientListeners.forEach((cb) => cb());
		clearPrintPortMessageTimeout();

		request.on('close', () => {
			unsubscribeClientDefaultPropsWatchers(clientId);
			unsubscribeClientFileExistenceWatchers(clientId);
			unsubscribeClientSequencePropsWatchers(clientId);
			clients = clients.filter((client) => client.id !== clientId);

			// If all clients disconnected, print a comment so user can easily restart it.
			if (clients.length === 0) {
				if (appInfoTimeout !== null) {
					clearTimeout(appInfoTimeout);
					appInfoTimeout = null;
				}

				latestAppInfoMessage = null;
				clearPrintPortMessageTimeout();

				printPortMessageTimeout = setTimeout(() => {
					printServerReadyComment('To restart', logLevel);
				}, 2500);
			}
		});

		return Promise.resolve();
	};

	const sendEventToClient = (event: EventSourceEvent) => {
		if (event.type === 'config-file-changed') {
			refreshAppInfo();
			configChangeListeners.forEach((listener) => listener());
		}

		clients.forEach((client) => {
			client.response.write(serializeMessage(event));
		});
	};

	const sendEventToClientId = (clientId: string, event: EventSourceEvent) => {
		const client = clients.find((c) => c.id === clientId);
		if (!client) {
			return false;
		}

		client.response.write(serializeMessage(event));
		return true;
	};

	const addNewClientListener = (cb: () => void) => {
		newClientListeners.push(cb);
		return () => {
			newClientListeners = newClientListeners.filter((l) => l !== cb);
		};
	};

	return {
		sendEventToClient,
		sendEventToClientId,
		router,
		addNewClientListener,
		closeConnections: () => {
			if (closed) {
				return Promise.resolve();
			}

			closed = true;
			if (appInfoTimeout !== null) {
				clearTimeout(appInfoTimeout);
				appInfoTimeout = null;
			}

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

export const getLiveEventsListener = (): LiveEventsServer | null =>
	liveEventsListener;

export const setLiveEventsListener = (listener: LiveEventsServer) => {
	liveEventsListener = listener;
	waiters.forEach((w) => w(listener));
	return () => {
		liveEventsListener = null;
	};
};
