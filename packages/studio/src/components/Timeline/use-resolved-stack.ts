import {useContext, useEffect, useState} from 'react';
import {Internals} from 'remotion';
import type {ResolvedStackLocation} from 'remotion';
import {getOriginalLocationFromStack} from './TimelineStack/get-stack';

const resolvedCache = new Map<string, ResolvedStackLocation | null>();
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

	const [value, setValue] = useState<ResolvedStackLocation | null>(() => {
		if (!stack) {
			return null;
		}

		return resolvedCache.get(stack) ?? null;
	});

	useEffect(() => {
		if (!stack) {
			return;
		}

		if (resolvedCache.has(stack)) {
			setValue(resolvedCache.get(stack)!);
			return;
		}

		if (!subscribers.has(stack)) {
			subscribers.set(stack, new Set());
		}

		const subs = subscribers.get(stack)!;
		subs.add(setValue);

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
				})
				.finally(() => {
					inFlight.delete(stack);
				});
		}

		return () => {
			subs.delete(setValue);
		};
	}, [stack, updateResolvedStackTrace]);

	return value;
};
