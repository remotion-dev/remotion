import type {EventSourceEvent} from './event-source-events';

let source: EventSource | null = null;

export const openEventSource = () => {
	source = new EventSource('/events');

	source.addEventListener('message', (event) => {
		const newEvent = JSON.parse(event.data) as EventSourceEvent;
		if (newEvent.type === 'new-input-props') {
			window.remotion_inputProps = JSON.stringify(newEvent.newProps);
		}
	});
};
