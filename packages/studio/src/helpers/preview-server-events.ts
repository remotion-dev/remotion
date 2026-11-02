/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type {EventSourceEvent} from '@remotion/studio-shared';
import {observePendingSequenceSplitSourceVersion} from '../components/Timeline/pending-sequence-splits';
import {
	BROWSER_STUDIO_OPERATIONS_READY_EVENT,
	getBrowserStudioOperations,
} from './browser-studio-operations';
import {queueSequenceNodePathMutation} from './sequence-node-path-mutations';
import {
	getSequencePropsSourceSession,
	setSequencePropsSourceSession,
} from './sequence-props-source-version';

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
	if (event.type === 'sequence-node-paths-remapped') {
		queueSequenceNodePathMutation(event.mutation);
	}

	if (
		(event.type === 'sequence-props-updated' ||
			event.type === 'lost-node-path') &&
		event.sourceVersion?.sessionId === getSequencePropsSourceSession()
	) {
		observePendingSequenceSplitSourceVersion(
			event.fileName,
			event.sourceVersion,
		);
	}

	if (event.type === 'init') {
		setSequencePropsSourceSession(event.sourceVersionSessionId);
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

	const eventSource = new EventSource('/events');
	source = eventSource;

	eventSource.addEventListener('message', (event) => {
		if (source !== eventSource) return;
		try {
			const newEvent = JSON.parse(event.data) as EventSourceEvent;
			dispatch(newEvent);
		} catch {
			// Ignore parse errors
		}
	});

	eventSource.addEventListener('open', () => {
		if (source !== eventSource) return;
		eventSource.addEventListener(
			'error',
			() => {
				if (source !== eventSource) return;
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

	if (window.remotion_isReadOnlyStudio) {
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

export const getPreviewServerConnectionState = () => connectionState;

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
