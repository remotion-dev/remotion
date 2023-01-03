import {notificationCenter} from './editor/components/Notifications/NotificationCenter';
import {renderJobsRef} from './editor/components/RenderQueue/context';
import {previewServerConnectionRef} from './editor/helpers/client-id';
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

	return () => {
		listeners = listeners.filter(
			(l) => l.type !== type || l.listener !== listener
		);
	};
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

		if (newEvent.type === 'init') {
			previewServerConnectionRef.current?.set({
				type: 'connected',
				clientId: newEvent.clientId,
			});
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

		if (newEvent.type === 'new-public-folder') {
			window.remotion_staticFiles = newEvent.files;
		}

		listeners.forEach((l) => {
			if (l.type === newEvent.type) {
				l.listener(newEvent);
			}
		});
	});

	source.addEventListener('open', () => {
		(source as EventSource).addEventListener(
			'error',
			() => {
				previewServerConnectionRef.current?.set({type: 'disconnected'});
				// Display an error message that the preview server has disconnected.
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
