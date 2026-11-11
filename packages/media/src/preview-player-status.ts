export type PreviewPlayerStatus =
	| {type: 'initializing'}
	| {type: 'ready'}
	| {type: 'fallback'}
	| {type: 'failed'; error: Error};

export type PreviewPlayerEvent =
	| {type: 'init-succeeded'}
	| {type: 'fallback-requested'}
	| {type: 'failed'; error: Error}
	| {type: 'reset'};

export const initialPreviewPlayerStatus: PreviewPlayerStatus = {
	type: 'initializing',
};

export const previewPlayerStatusReducer = (
	state: PreviewPlayerStatus,
	event: PreviewPlayerEvent,
): PreviewPlayerStatus => {
	if (state.type === 'failed') {
		return state;
	}

	switch (event.type) {
		case 'init-succeeded':
			return state.type === 'initializing' ? {type: 'ready'} : state;
		case 'fallback-requested':
			return state.type === 'fallback' ? state : {type: 'fallback'};
		case 'failed':
			return {type: 'failed', error: event.error};
		case 'reset':
			return state.type === 'initializing' ? state : {type: 'initializing'};
		default:
			throw new Error(
				`Unhandled preview player event: ${JSON.stringify(event satisfies never)}`,
			);
	}
};
