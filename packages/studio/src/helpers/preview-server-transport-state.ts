export type PreviewServerTransport =
	| {type: 'idle'}
	| {type: 'event-source'; source: EventSource; opened: boolean}
	| {type: 'retry-scheduled'; timeout: ReturnType<typeof setTimeout>}
	| {type: 'browser-studio'; unsubscribe: () => void};

export type PreviewServerTransportEvent =
	| {type: 'event-source-created'; source: EventSource}
	| {type: 'event-source-opened'; source: EventSource}
	| {
			type: 'event-source-failed';
			source: EventSource;
			timeout: ReturnType<typeof setTimeout>;
	  }
	| {type: 'retry-fired'}
	| {type: 'browser-studio-connected'; unsubscribe: () => void};

export const transitionPreviewServerTransport = (
	state: PreviewServerTransport,
	event: PreviewServerTransportEvent,
): PreviewServerTransport => {
	if (state.type === 'browser-studio') {
		return state;
	}

	switch (event.type) {
		case 'browser-studio-connected':
			return {type: 'browser-studio', unsubscribe: event.unsubscribe};
		case 'event-source-created':
			return state.type === 'idle'
				? {type: 'event-source', source: event.source, opened: false}
				: state;
		case 'event-source-opened':
			return state.type === 'event-source' && state.source === event.source
				? {...state, opened: true}
				: state;
		case 'event-source-failed':
			return state.type === 'event-source' && state.source === event.source
				? {type: 'retry-scheduled', timeout: event.timeout}
				: state;
		case 'retry-fired':
			return state.type === 'retry-scheduled' ? {type: 'idle'} : state;
		default:
			throw new Error(
				'Unknown event: ' + JSON.stringify(event satisfies never),
			);
	}
};
