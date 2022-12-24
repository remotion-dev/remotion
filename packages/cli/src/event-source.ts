import {notificationCenter} from './editor/components/Notifications/NotificationCenter';
import {serverDisconnectedRef} from './editor/components/Notifications/ServerDisconnected';
import {renderJobsRef} from './editor/components/RenderQueue/context';
import type {EventSourceEvent} from './event-source-events';

let source: EventSource | null = null;

let listeners: {
	type: string;
	listener: (event: EventSourceEvent) => void;
}[] = [];

export const subscribeToEvent = (
	type: EventSourceEvent['type'],
	listener: (event: EventSourceEvent) => void
) => {
	listeners.push({type, listener});
};

export const unsubscribeFromEvent = (
	type: EventSourceEvent['type'],
	listener: (event: EventSourceEvent) => void
) => {
	listeners = listeners.filter(
		(l) => l.type !== type || l.listener !== listener
	);
};

export const openEventSource = () => {
	source = new EventSource('/events');

	source.addEventListener('message', (event) => {
		const newEvent = JSON.parse(event.data) as EventSourceEvent;
		if (
			newEvent.type === 'new-input-props' ||
			newEvent.type === 'new-env-variables'
		) {
			window.location.reload();
		}

		if (newEvent.type === 'render-queue-updated') {
			renderJobsRef.current?.updateRenderJobs(newEvent.queue);
		}

		if (newEvent.type === 'render-job-failed') {
			notificationCenter.current?.addNotification({
				content: `Rendering "${newEvent.compositionId}" failed`,
				duration: 2000,
				created: Date.now(),
				id: String(Math.random()).replace('0.', ''),
			});
		}

		listeners.forEach((l) => {
			if (l.type === newEvent.type) {
				l.listener(newEvent);
			}
		});
	});

	source.addEventListener('open', () => {
		serverDisconnectedRef.current?.setServerConnected();

		(source as EventSource).addEventListener(
			'error',
			() => {
				// Display an error message that the preview server has disconnected.
				serverDisconnectedRef.current?.setServerDisconnected();
				source?.close();

				// Retry later
				setTimeout(() => {
					openEventSource();
				}, 1000);
			},
			{once: true}
		);
	});
};
