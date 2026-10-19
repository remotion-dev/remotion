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

	const [resolved, setResolved] = useState(() => ({
		stack,
		location: stack ? (resolvedCache.get(stack) ?? null) : null,
	}));

	useEffect(() => {
		if (!stack) {
			return;
		}

		if (resolvedCache.has(stack)) {
			setResolved({stack, location: resolvedCache.get(stack)!});
			return;
		}

		if (!subscribers.has(stack)) {
			subscribers.set(stack, new Set());
		}

		const subs = subscribers.get(stack)!;
		const onResolve = (location: ResolvedStackLocation | null) => {
			setResolved({stack, location});
		};

		subs.add(onResolve);

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
			subs.delete(onResolve);
		};
	}, [stack, updateResolvedStackTrace]);

	// Effects run after rendering, so state may still belong to the previous
	// stack. Only expose a location resolved for the current stack.
	return resolved.stack === stack
		? resolved.location
		: stack
			? (resolvedCache.get(stack) ?? null)
			: null;
};
