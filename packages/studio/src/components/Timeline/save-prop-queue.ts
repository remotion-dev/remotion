import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {showNotification} from '../Notifications/NotificationCenter';

type SetPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
	values: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse,
) => void;

type QueueState = {
	chain: Promise<unknown>;
	cancelled: boolean;
	error: unknown | null;
};

const queues = new Map<string, QueueState>();

const getQueue = (nodePath: SequencePropsSubscriptionKey): QueueState => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	let q = queues.get(key);
	if (!q) {
		q = {chain: Promise.resolve(), cancelled: false, error: null};
		queues.set(key, q);
	}

	return q;
};

const dropQueue = (
	nodePath: SequencePropsSubscriptionKey,
	q: QueueState,
): void => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	if (queues.get(key) === q) {
		queues.delete(key);
	}
};

export type EnqueueSaveOptions<TResponse> = {
	nodePath: SequencePropsSubscriptionKey;
	setPropStatuses: SetPropStatuses;
	applyOptimistic: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse;
	applyServerResponse?: (
		prev: CanUpdateSequencePropsResponse,
		response: TResponse,
	) => CanUpdateSequencePropsResponse;
	apiCall: () => Promise<TResponse>;
	errorLabel: string;
};

type EnqueueSaveOptionsWithError<TResponse> = EnqueueSaveOptions<TResponse> & {
	readonly onError: ((error: unknown) => void) | null;
};

const enqueueSavePropChangeInternal = <TResponse>({
	nodePath,
	setPropStatuses,
	applyOptimistic,
	applyServerResponse,
	apiCall,
	errorLabel,
	onError,
}: EnqueueSaveOptionsWithError<TResponse>): Promise<void> => {
	const q = getQueue(nodePath);

	if (q.cancelled) {
		return Promise.resolve();
	}

	setPropStatuses(nodePath, (prev) => {
		return applyOptimistic(prev);
	});

	const myQueue = q;
	const next = myQueue.chain.then(async () => {
		if (myQueue.cancelled) {
			onError?.(
				myQueue.error ??
					new Error('The sequence prop save queue was cancelled'),
			);
			return;
		}

		try {
			const response = await apiCall();
			if (myQueue.cancelled) {
				return;
			}

			// If nothing more is queued, reset baseline so the next round starts fresh.
			if (myQueue.chain === next) {
				if (applyServerResponse) {
					setPropStatuses(nodePath, (prev) =>
						applyServerResponse(prev, response),
					);
				}

				dropQueue(nodePath, myQueue);
			}
		} catch (err) {
			myQueue.cancelled = true;
			myQueue.error = err;
			onError?.(err);

			dropQueue(nodePath, myQueue);
			showNotification(
				`${errorLabel}: ${err instanceof Error ? err.message : String(err)}`,
				4000,
			);
		}
	});

	myQueue.chain = next;
	return next;
};

export const enqueueSavePropChange = <TResponse>(
	options: EnqueueSaveOptions<TResponse>,
): Promise<void> => {
	return enqueueSavePropChangeInternal({...options, onError: null});
};

export const enqueueSavePropChangeWithError = <TResponse>({
	onError,
	...options
}: EnqueueSaveOptions<TResponse> & {
	readonly onError: (error: unknown) => void;
}): Promise<void> => {
	return enqueueSavePropChangeInternal({...options, onError});
};
