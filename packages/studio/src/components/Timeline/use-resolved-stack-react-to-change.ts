import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useRef, useState} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {FastRefreshContext} from '../../fast-refresh-context';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {hasResolvedStack, useResolvedStack} from './use-resolved-stack';

// This case: https://github.com/remotion-dev/remotion/issues/7393
// A code change has been made and we cannot re-calculate the stack right away.
// In that case, we wait for fast refresh, wait for the new stack trace, triggering a new event.

const matchesSourceLocation = (
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
	const {fastRefreshes} = useContext(FastRefreshContext);
	const [stackState, setStackState] = useState(() => ({
		stack: getStack(),
		preferMappedNodePath: true,
	}));
	const resolvedLocationFromStack = useResolvedStack(stackState.stack);
	const resolvedLocation = hasResolvedStack(stackState.stack)
		? resolvedLocationFromStack
		: null;
	const resolvedLocationRef = useRef(resolvedLocation);
	resolvedLocationRef.current = resolvedLocation;
	const getStackRef = useRef(getStack);
	getStackRef.current = getStack;

	useEffect(() => {
		if (fastRefreshes === 0) {
			return;
		}

		const newStack = getStackRef.current();
		setStackState((current) => {
			if (newStack === current.stack) {
				return current;
			}

			return {
				stack: newStack,
				// Resolve from the post-refresh source location. The previous node path
				// may now belong to a sibling after a structural edit.
				preferMappedNodePath: false,
			};
		});
	}, [fastRefreshes]);

	useEffect(() => {
		let interval: Timer | null = null;

		const handleEvent = (event: EventSourceEvent) => {
			if (event.type !== 'lost-node-path') {
				return;
			}

			if (!matchesSourceLocation(event, resolvedLocationRef.current)) {
				return;
			}

			const initialStack = getStackRef.current();

			if (interval !== null) {
				clearInterval(interval);
			}

			interval = setInterval(() => {
				const newStack = getStackRef.current();
				if (newStack !== initialStack) {
					if (interval !== null) {
						clearInterval(interval);
						interval = null;
					}

					setStackState({
						stack: newStack,
						// The old override ID may now belong to a sibling. Resolve the
						// node path from the post-refresh source location instead.
						preferMappedNodePath: false,
					});
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
	}, [subscribeToEvent]);

	return {
		preferMappedNodePath: stackState.preferMappedNodePath,
		resolvedLocation,
		stack: stackState.stack,
	};
};
