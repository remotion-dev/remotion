import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {getSourceMutationRevision} from '../../helpers/source-mutation-queue';
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
};

const queues = new Map<string, QueueState>();

const getQueue = (nodePath: SequencePropsSubscriptionKey): QueueState => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	let q = queues.get(key);
	if (!q) {
		q = {chain: Promise.resolve(), cancelled: false};
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

export const enqueueSavePropChangeWithResult = <TResponse>({
	nodePath,
	setPropStatuses,
	applyOptimistic,
	applyServerResponse,
	apiCall,
}: EnqueueSaveOptions<TResponse>): Promise<TResponse> => {
	const q = getQueue(nodePath);

	if (q.cancelled) {
		return Promise.reject(new Error('This edit was cancelled'));
	}

	setPropStatuses(nodePath, (prev) => {
		return applyOptimistic(prev);
	});

	const myQueue = q;
	const request = new Promise<TResponse>((resolve) => resolve(apiCall()));
	const revision = getSourceMutationRevision();
	const next = Promise.resolve().then(async () => {
		try {
			const response = await request;
			if (myQueue.cancelled) {
				return response;
			}

			// If nothing more is queued, reset baseline so the next round starts fresh.
			if (myQueue.chain === next) {
				if (applyServerResponse && revision === getSourceMutationRevision()) {
					setPropStatuses(nodePath, (prev) =>
						applyServerResponse(prev, response),
					);
				}

				dropQueue(nodePath, myQueue);
			}

			return response;
		} catch (err) {
			myQueue.cancelled = true;

			dropQueue(nodePath, myQueue);
			throw err;
		}
	});

	myQueue.chain = next;
	return next;
};

// Existing callers display failures through the queue's notification. Gesture
// owners additionally need the result to roll back only their own preview.
export const enqueueSavePropChange = <TResponse>(
	options: EnqueueSaveOptions<TResponse>,
): Promise<void> =>
	enqueueSavePropChangeWithResult(options).then(
		() => undefined,
		(err) => {
			showNotification(
				`${options.errorLabel}: ${err instanceof Error ? err.message : String(err)}`,
				4000,
			);
		},
	);
