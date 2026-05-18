import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext} from 'react';
import {useState} from 'react';
import {useEffect} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useResolvedStack} from './use-resolved-stack';

// This case: https://github.com/remotion-dev/remotion/issues/7393
// A code change has been made and we cannot re-calculate the stack right away.
// In that case, we wait for fast refresh, wait for the new stack trace, triggering a new event.
// TODO: Not all stacks are changing for every sequence, we shall not poll immediately

export const useResolveStackAndReactToChange = (
	getStack: () => string | null,
) => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const [stack, setStack] = useState<string | null>(() => getStack());

	useEffect(() => {
		let interval: Timer | null = null;

		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'lost-node-path') {
				return;
			}

			const initialStack = getStack();

			if (interval !== null) {
				clearInterval(interval);
			}

			interval = setInterval(() => {
				const newStack = getStack();
				if (newStack !== initialStack) {
					if (interval !== null) {
						clearInterval(interval);
						interval = null;
					}

					setStack(newStack);
				}
			}, 10);
		};

		const unsubscribe = subscribeToEvent('lost-node-path', handleEvent);

		return () => {
			unsubscribe();
			if (interval !== null) {
				clearInterval(interval);
			}
		};
	}, [subscribeToEvent, getStack]);

	return useResolvedStack(stack);
};
