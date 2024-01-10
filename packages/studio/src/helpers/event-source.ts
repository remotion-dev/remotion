import type {WatchRemotionStaticFilesPayload} from 'remotion';
import {Internals} from 'remotion';
import {sendErrorNotification} from '../components/Notifications/NotificationCenter';
import playBeepSound from '../components/PlayBeepSound';
import {renderJobsRef} from '../components/RenderQueue/context';
import type {EventSourceEvent} from '../event-source-events';
import {studioServerConnectionRef} from './client-id';

let source: EventSource | null = null;

let listeners: {
	type: string;
	listener: (event: EventSourceEvent) => void;
}[] = [];

export const subscribeToEvent = (
	type: EventSourceEvent['type'],
	listener: (event: EventSourceEvent) => void,
) => {
	listeners.push({type, listener});

	return () => {
		listeners = listeners.filter(
			(l) => l.type !== type || l.listener !== listener,
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
			studioServerConnectionRef.current?.set({
				type: 'connected',
				clientId: newEvent.clientId,
			});
		}

		if (newEvent.type === 'render-queue-updated') {
			renderJobsRef.current?.updateRenderJobs(newEvent.queue);
			for (const job of newEvent.queue) {
				if (job.status === 'done' && job.beepOnFinish) {
					playBeepSound(job.id);
				}
			}
		}

		if (newEvent.type === 'render-job-failed') {
			sendErrorNotification(`Rendering "${newEvent.compositionId}" failed`);
		}

		if (newEvent.type === 'new-public-folder') {
			const payload: WatchRemotionStaticFilesPayload = {
				files: newEvent.files,
			};

			window.dispatchEvent(
				new CustomEvent(Internals.WATCH_REMOTION_STATIC_FILES, {
					detail: payload,
				}),
			);
			window.remotion_staticFiles = newEvent.files;
			window.remotion_publicFolderExists = newEvent.folderExists;
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
				studioServerConnectionRef.current?.set({type: 'disconnected'});
				// Display an error message that the studio server has disconnected.
				source?.close();

				// Retry later
				setTimeout(() => {
					openEventSource();
				}, 1000);
			},
			{once: true},
		);
	});
};
