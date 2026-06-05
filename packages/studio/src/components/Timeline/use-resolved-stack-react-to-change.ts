import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useRef, useState} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {useResolvedStack} from './use-resolved-stack';

// This case: https://github.com/remotion-dev/remotion/issues/7393
// A code change has been made and we cannot re-calculate the stack right away.
// In that case, we wait for fast refresh, wait for the new stack trace, triggering a new event.

const matchesLostNodePathEvent = (
	event: Extract<EventSourceEvent, {type: 'lost-node-path'}>,
	location: ResolvedStackLocation | null,
): boolean => {
	if (!location?.source || !location.line) {
		return false;
	}

	return (
		event.fileName === location.source &&
		event.line === location.line &&
		event.column === (location.column ?? 0)
	);
};

export const useResolveStackAndReactToChange = (
	getStack: () => string | null,
) => {
	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const [stack, setStack] = useState<string | null>(() => getStack());
	const resolvedLocation = useResolvedStack(stack);
	const resolvedLocationRef = useRef(resolvedLocation);
	resolvedLocationRef.current = resolvedLocation;

	useEffect(() => {
		setStack(getStack());
	}, [getStack]);

	useEffect(() => {
		let interval: Timer | null = null;

		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'lost-node-path') {
				return;
			}

			if (!matchesLostNodePathEvent(event, resolvedLocationRef.current)) {
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

	return resolvedLocation;
};
