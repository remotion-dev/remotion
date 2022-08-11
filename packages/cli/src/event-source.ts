import {serverDisconnectedRef} from './editor/components/Notifications/ServerDisconnected';
import type {EventSourceEvent} from './event-source-events';

let source: EventSource | null = null;

export const openEventSource = () => {
	source = new EventSource('/events');

	source.addEventListener('message', (event) => {
		const newEvent = JSON.parse(event.data) as EventSourceEvent;
		if (newEvent.type === 'new-input-props') {
			window.location.reload();
		}
	});

	source.addEventListener('error', () => {
		// Display an error message that the preview server has disconnected.
		serverDisconnectedRef.current?.setServerDisconnected();
	});
};
