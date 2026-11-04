import {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import type {ResolvedStackLocation} from 'remotion';
import {getOriginalLocationFromStack} from './TimelineStack/get-stack';

const resolvedCache = new Map<string, ResolvedStackLocation | null>();

export const hasResolvedStack = (stack: string | null): boolean => {
	if (!stack) {
		return true;
	}

	return resolvedCache.has(stack);
};

export const getCachedResolvedStack = (
	stack: string | null,
): ResolvedStackLocation | null => {
	return stack ? (resolvedCache.get(stack) ?? null) : null;
};

const inFlight = new Set<string>();
const subscribers = new Map<
	string,
	Set<(value: ResolvedStackLocation | null) => void>
>();

export const useResolvedStack = (
	stack: string | null,
): ResolvedStackLocation | null => {
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);

	// Holds a new object on every resolution, so that a stack resolving to null
	// still re-renders consumers that read hasResolvedStack().
	const [state, setState] = useState<{
		stack: string | null;
		value: ResolvedStackLocation | null;
	}>(() => ({
		stack,
		value: stack ? (resolvedCache.get(stack) ?? null) : null,
	}));

	useEffect(() => {
		if (!stack) {
			return;
		}

		if (resolvedCache.has(stack)) {
			const cached = resolvedCache.get(stack)!;
			setState((prev) =>
				prev.stack === stack && prev.value === cached
					? prev
					: {stack, value: cached},
			);
			return;
		}

		if (!subscribers.has(stack)) {
			subscribers.set(stack, new Set());
		}

		const subs = subscribers.get(stack)!;
		const onResolved = (value: ResolvedStackLocation | null) => {
			setState({stack, value});
		};

		subs.add(onResolved);

		if (!inFlight.has(stack)) {
			inFlight.add(stack);

			getOriginalLocationFromStack(stack, 'sequence')
				.then((frame) => {
					resolvedCache.set(stack, frame);
					updateResolvedStackTrace(stack, frame);
					subs.forEach((fn) => fn(frame));
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.error('Could not get original location of Sequence', err);
					resolvedCache.set(stack, null);
					subs.forEach((fn) => fn(null));
				})
				.finally(() => {
					inFlight.delete(stack);
				});
		}

		return () => {
			subs.delete(onResolved);
		};
	}, [stack, updateResolvedStackTrace]);

	// Effects run after rendering, so state may still belong to the previous
	// stack. Only expose a location resolved for the current stack.
	return state.stack === stack
		? state.value
		: stack
			? (resolvedCache.get(stack) ?? null)
			: null;
};
