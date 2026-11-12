/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type {EventSourceEvent} from '@remotion/studio-shared';
import {observePendingSequenceSplitSourceVersion} from '../components/Timeline/pending-sequence-splits';
import {
	BROWSER_STUDIO_OPERATIONS_READY_EVENT,
	getBrowserStudioOperations,
} from './browser-studio-operations';
import {recordExternalSourceChange} from './external-source-changes';
import {observeCompositionOperationsBuild} from './optimistic-composition-operations';
import type {
	PreviewServerTransport,
	PreviewServerTransportEvent,
} from './preview-server-transport-state';
import {transitionPreviewServerTransport} from './preview-server-transport-state';
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

let transport: PreviewServerTransport = {type: 'idle'};
let browserStudioReadyListenerInstalled = false;
let connectionState: PreviewServerConnectionState = {type: 'init'};
let lastInitEvent: Extract<EventSourceEvent, {type: 'init'}> | null = null;
const pendingHmrEvents: Extract<EventSourceEvent, {type: 'hmr'}>[] = [];
const messageListeners = new Set<MessageListener>();
const connectionStateListeners = new Set<ConnectionStateListener>();

const notifyConnectionState = () => {
	for (const listener of connectionStateListeners) {
		listener(connectionState);
	}
};

const dispatch = (event: EventSourceEvent) => {
	if (event.type === 'external-source-changed') {
		recordExternalSourceChange(
			event.fileName,
			event.sourceVersion,
			event.resetUndoHistory,
		);
	}

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

	if (event.type === 'hmr') {
		observeCompositionOperationsBuild(event.hmrEvent);
		if (messageListeners.size === 0) {
			pendingHmrEvents.push(event);
		}
	}

	for (const listener of messageListeners) {
		listener(event);
	}
};

const applyTransportEvent = (event: PreviewServerTransportEvent) => {
	const prev = transport;
	const next = transitionPreviewServerTransport(prev, event);
	transport = next;

	if (next === prev) {
		if (event.type === 'event-source-created') {
			event.source.close();
		} else if (event.type === 'event-source-failed') {
			clearTimeout(event.timeout);
		} else if (event.type === 'browser-studio-connected') {
			event.unsubscribe();
		}

		return;
	}

	if (
		prev.type === 'event-source' &&
		(next.type !== 'event-source' || next.source !== prev.source)
	) {
		prev.source.close();
	}

	if (prev.type === 'retry-scheduled' && event.type !== 'retry-fired') {
		clearTimeout(prev.timeout);
	}
};

const connectToBrowserStudio = () => {
	if (transport.type === 'browser-studio') {
		return true;
	}

	const browserStudioOperations = getBrowserStudioOperations();
	if (!browserStudioOperations) {
		return false;
	}

	applyTransportEvent({
		type: 'browser-studio-connected',
		unsubscribe: browserStudioOperations.subscribeToEvent(dispatch),
	});
	return true;
};

const openEventSource = () => {
	if (transport.type !== 'idle') {
		return;
	}

	const eventSource = new EventSource('/events');
	applyTransportEvent({type: 'event-source-created', source: eventSource});

	eventSource.addEventListener('message', (event) => {
		if (transport.type !== 'event-source' || transport.source !== eventSource) {
			return;
		}

		try {
			const newEvent = JSON.parse(event.data) as EventSourceEvent;
			dispatch(newEvent);
		} catch {
			// Ignore parse errors
		}
	});

	eventSource.addEventListener('open', () => {
		applyTransportEvent({type: 'event-source-opened', source: eventSource});
	});

	// A non-2xx or non-event-stream response closes the EventSource without
	// ever firing 'open', and the browser does not retry it.
	eventSource.addEventListener('error', () => {
		if (transport.type !== 'event-source' || transport.source !== eventSource) {
			return;
		}

		// Before the first 'open', the browser natively retries network errors
		if (
			!transport.opened &&
			eventSource.readyState === EventSource.CONNECTING
		) {
			return;
		}

		connectionState = {type: 'disconnected'};
		notifyConnectionState();

		applyTransportEvent({
			type: 'event-source-failed',
			source: eventSource,
			timeout: setTimeout(() => {
				applyTransportEvent({type: 'retry-fired'});
				openEventSource();
			}, 1000),
		});
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

	for (const event of pendingHmrEvents.splice(0)) {
		listener(event);
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
