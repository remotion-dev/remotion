export type ServerRenderSubmitState =
	| {type: 'idle'}
	| {type: 'submitting'}
	| {type: 'failed'; message: string};

export type ServerRenderSubmitEvent =
	| {type: 'submit'}
	| {type: 'reject'; message: string};

export const initialServerRenderSubmitState: ServerRenderSubmitState = {
	type: 'idle',
};

export const serverRenderSubmitReducer = (
	state: ServerRenderSubmitState,
	event: ServerRenderSubmitEvent,
): ServerRenderSubmitState => {
	if (event.type === 'submit') {
		return state.type === 'submitting' ? state : {type: 'submitting'};
	}

	if (event.type === 'reject') {
		return state.type === 'submitting'
			? {type: 'failed', message: event.message}
			: state;
	}

	return state;
};
