/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type {EventSourceEvent} from '@remotion/studio-shared';

export type PreviewServerConnectionState =
	| {
			type: 'init';
	  }
	| {
			type: 'connected';
			clientId: string;
	  }
	| {
			type: 'disconnected';
	  };

type MessageListener = (event: EventSourceEvent) => void;
type ConnectionStateListener = (state: PreviewServerConnectionState) => void;

let source: EventSource | null = null;
let connectionState: PreviewServerConnectionState = {type: 'init'};
let lastInitEvent: Extract<EventSourceEvent, {type: 'init'}> | null = null;
const messageListeners = new Set<MessageListener>();
const connectionStateListeners = new Set<ConnectionStateListener>();

const notifyConnectionState = () => {
	for (const listener of connectionStateListeners) {
		listener(connectionState);
	}
};

const dispatch = (event: EventSourceEvent) => {
	for (const listener of messageListeners) {
		listener(event);
	}
};

const openEventSource = () => {
	if (source) {
		return;
	}

	source = new EventSource('/events');

	source.addEventListener('message', (event) => {
		try {
			const newEvent = JSON.parse(event.data) as EventSourceEvent;
			if (newEvent.type === 'init') {
				lastInitEvent = newEvent;
				connectionState = {
					type: 'connected',
					clientId: newEvent.clientId,
				};
				notifyConnectionState();
			}

			dispatch(newEvent);
		} catch {
			// Ignore parse errors
		}
	});

	source.addEventListener('open', () => {
		source?.addEventListener(
			'error',
			() => {
				connectionState = {type: 'disconnected'};
				notifyConnectionState();
				source?.close();
				source = null;

				setTimeout(() => {
					openEventSource();
				}, 1000);
			},
			{once: true},
		);
	});
};

export const ensurePreviewServerEventSource = () => {
	if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
		return;
	}

	openEventSource();
};

export const subscribeToPreviewServerEvents = (
	listener: MessageListener,
): (() => void) => {
	ensurePreviewServerEventSource();
	messageListeners.add(listener);

	if (lastInitEvent && connectionState.type === 'connected') {
		listener(lastInitEvent);
	}

	return () => {
		messageListeners.delete(listener);
	};
};

export const subscribeToPreviewServerConnectionState = (
	listener: ConnectionStateListener,
): (() => void) => {
	ensurePreviewServerEventSource();
	connectionStateListeners.add(listener);
	listener(connectionState);

	return () => {
		connectionStateListeners.delete(listener);
	};
};
