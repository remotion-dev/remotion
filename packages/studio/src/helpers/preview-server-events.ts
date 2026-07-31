/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type {EventSourceEvent} from '@remotion/studio-shared';
import {
	BROWSER_STUDIO_OPERATIONS_READY_EVENT,
	getBrowserStudioOperations,
} from './browser-studio-operations';

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
let unsubscribeFromBrowserStudio: (() => void) | null = null;
let browserStudioReadyListenerInstalled = false;
let connectionState: PreviewServerConnectionState = {type: 'init'};
let lastInitEvent: Extract<EventSourceEvent, {type: 'init'}> | null = null;
let pendingHmrEvent: Extract<EventSourceEvent, {type: 'hmr'}> | null = null;
const messageListeners = new Set<MessageListener>();
const connectionStateListeners = new Set<ConnectionStateListener>();

const notifyConnectionState = () => {
	for (const listener of connectionStateListeners) {
		listener(connectionState);
	}
};

const dispatch = (event: EventSourceEvent) => {
	if (event.type === 'init') {
		lastInitEvent = event;
		connectionState = {
			type: 'connected',
			clientId: event.clientId,
		};
		notifyConnectionState();
	}

	if (event.type === 'hmr' && messageListeners.size === 0) {
		pendingHmrEvent = event;
	}

	for (const listener of messageListeners) {
		listener(event);
	}
};

const connectToBrowserStudio = () => {
	if (unsubscribeFromBrowserStudio) {
		return true;
	}

	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return false;
	}

	if (source) {
		source.close();
		source = null;
	}

	unsubscribeFromBrowserStudio =
		browserStudioOperations.subscribeToEvent(dispatch);
	return true;
};

const openEventSource = () => {
	if (source) {
		return;
	}

	source = new EventSource('/events');

	source.addEventListener('message', (event) => {
		try {
			const newEvent = JSON.parse(event.data) as EventSourceEvent;
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
	if (typeof window === 'undefined') {
		return;
	}

	if (!browserStudioReadyListenerInstalled) {
		browserStudioReadyListenerInstalled = true;
		window.addEventListener(
			BROWSER_STUDIO_OPERATIONS_READY_EVENT,
			connectToBrowserStudio,
		);
	}

	if (connectToBrowserStudio()) {
		return;
	}

	if (typeof EventSource === 'undefined') {
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

	if (pendingHmrEvent) {
		listener(pendingHmrEvent);
		pendingHmrEvent = null;
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
