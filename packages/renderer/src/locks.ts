type Waiter = {id: number; grant: () => void};

export type MutexState =
	| {type: 'free'}
	| {type: 'held'; holderId: number; queue: Waiter[]};

export type MutexEvent =
	| {type: 'acquire'; waiter: Waiter}
	| {type: 'release'; id: number}
	| {type: 'waiter-timed-out'; id: number};

export const mutexTransition = (
	state: MutexState,
	event: MutexEvent,
): {state: MutexState; granted: Waiter | null} => {
	switch (event.type) {
		case 'acquire':
			if (state.type === 'free') {
				return {
					state: {type: 'held', holderId: event.waiter.id, queue: []},
					granted: event.waiter,
				};
			}

			return {
				state: {...state, queue: [...state.queue, event.waiter]},
				granted: null,
			};
		case 'release': {
			if (state.type === 'free' || state.holderId !== event.id) {
				return {state, granted: null};
			}

			const [next, ...rest] = state.queue;
			if (!next) {
				return {state: {type: 'free'}, granted: null};
			}

			return {
				state: {type: 'held', holderId: next.id, queue: rest},
				granted: next,
			};
		}

		case 'waiter-timed-out':
			if (state.type === 'free') {
				return {state, granted: null};
			}

			return {
				state: {
					...state,
					queue: state.queue.filter((w) => w.id !== event.id),
				},
				granted: null,
			};
		default:
			throw new Error('Unknown mutex event ' + (event satisfies never));
	}
};

export const createMutex = ({timeout}: {timeout: number | null}) => {
	let state: MutexState = {type: 'free'};
	let nextId = 1;

	const dispatch = (event: MutexEvent) => {
		const result = mutexTransition(state, event);
		state = result.state;
		result.granted?.grant();
	};

	const acquire = (): Promise<() => void> => {
		return new Promise((resolve) => {
			const id = nextId++;
			let timer: ReturnType<typeof setTimeout> | null = null;
			const release = () => dispatch({type: 'release', id});

			dispatch({
				type: 'acquire',
				waiter: {
					id,
					grant: () => {
						if (timer !== null) {
							clearTimeout(timer);
						}

						resolve(release);
					},
				},
			});

			if (state.type === 'held' && state.holderId !== id && timeout !== null) {
				timer = setTimeout(() => {
					dispatch({type: 'waiter-timed-out', id});
					resolve(() => undefined);
				}, timeout);
			}
		});
	};

	return {acquire};
};
