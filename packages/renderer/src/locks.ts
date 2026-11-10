type Waiter = {id: number; grant: () => void};

export type MutexState =
	| {type: 'free'}
	| {type: 'held'; holderIds: number[]; queue: Waiter[]};

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
					state: {type: 'held', holderIds: [event.waiter.id], queue: []},
					granted: event.waiter,
				};
			}

			return {
				state: {...state, queue: [...state.queue, event.waiter]},
				granted: null,
			};
		case 'release': {
			if (state.type === 'free' || !state.holderIds.includes(event.id)) {
				return {state, granted: null};
			}

			const holderIds = state.holderIds.filter((id) => id !== event.id);
			if (holderIds.length > 0) {
				return {state: {...state, holderIds}, granted: null};
			}

			const [next, ...rest] = state.queue;
			if (!next) {
				return {state: {type: 'free'}, granted: null};
			}

			return {
				state: {type: 'held', holderIds: [next.id], queue: rest},
				granted: next,
			};
		}

		case 'waiter-timed-out': {
			if (state.type === 'free') {
				return {state, granted: null};
			}

			const waiter = state.queue.find((w) => w.id === event.id);
			if (!waiter) {
				return {state, granted: null};
			}

			return {
				state: {
					type: 'held',
					holderIds: [...state.holderIds, waiter.id],
					queue: state.queue.filter((w) => w.id !== event.id),
				},
				granted: waiter,
			};
		}

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

			dispatch({
				type: 'acquire',
				waiter: {
					id,
					grant: () => {
						if (timer !== null) {
							clearTimeout(timer);
						}

						resolve(() => dispatch({type: 'release', id}));
					},
				},
			});

			if (
				state.type === 'held' &&
				!state.holderIds.includes(id) &&
				timeout !== null
			) {
				timer = setTimeout(() => {
					dispatch({type: 'waiter-timed-out', id});
				}, timeout);
			}
		});
	};

	return {acquire};
};
