export type BufferIndicatorState =
	| {type: 'idle'}
	| {type: 'pending'}
	| {type: 'showing'};

export type BufferIndicatorEvent =
	| {type: 'buffer-start'; delayInMilliseconds: number}
	| {type: 'buffer-end'}
	| {type: 'delay-elapsed'};

export type BufferIndicatorEffect = 'start-timer' | 'clear-timer' | null;

export const reduceBufferIndicator = (
	state: BufferIndicatorState,
	event: BufferIndicatorEvent,
): {state: BufferIndicatorState; effect: BufferIndicatorEffect} => {
	switch (event.type) {
		case 'buffer-start':
			if (state.type !== 'idle') {
				return {state, effect: null};
			}

			return event.delayInMilliseconds === 0
				? {state: {type: 'showing'}, effect: null}
				: {state: {type: 'pending'}, effect: 'start-timer'};
		case 'buffer-end':
			if (state.type === 'idle') {
				return {state, effect: null};
			}

			return {
				state: {type: 'idle'},
				effect: state.type === 'pending' ? 'clear-timer' : null,
			};
		case 'delay-elapsed':
			return state.type === 'pending'
				? {state: {type: 'showing'}, effect: null}
				: {state, effect: null};
		default:
			throw new Error(
				'Unhandled buffer indicator event: ' +
					JSON.stringify(event satisfies never),
			);
	}
};
