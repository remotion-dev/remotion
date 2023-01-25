import {serverDisconnectedRef} from './editor/components/Notifications/ServerDisconnected';
import type {EventSourceEvent} from './event-source-events';

let source: EventSource | null = null;

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

		if (newEvent.type === 'new-public-folder') {
			window.remotion_staticFiles = newEvent.files;
		}
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
