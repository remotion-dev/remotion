import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SubscribeToSequencePropsBatchResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

type PendingSequencePropsSubscription = {
	request: SubscribeToSequencePropsRequest;
	resolve: (response: SubscribeToSequencePropsResponse) => void;
	reject: (error: unknown) => void;
};

let pendingSequencePropsSubscriptions: PendingSequencePropsSubscription[] = [];
let sequencePropsSubscriptionTimer: ReturnType<typeof setTimeout> | null = null;

const flushSequencePropsSubscriptions = () => {
	sequencePropsSubscriptionTimer = null;
	const pending = pendingSequencePropsSubscriptions;
	pendingSequencePropsSubscriptions = [];
	const firstRequest = pending[0].request;

	callApi('/api/subscribe-to-sequence-props', {
		...firstRequest,
		requests: pending.map(({request}) => request),
	}).then(
		(response: SubscribeToSequencePropsBatchResponse) => {
			if (!Array.isArray(response.results)) {
				pending[0].resolve(response as SubscribeToSequencePropsResponse);
				const error = new Error(
					'Legacy single subscription response received for a batched request',
				);
				for (const item of pending.slice(1)) {
					item.reject(error);
				}

				return;
			}

			if (response.results.length !== pending.length) {
				const error = new Error(
					`Expected ${pending.length} sequence prop subscription results, got ${response.results.length}`,
				);
				for (const item of pending) {
					item.reject(error);
				}

				return;
			}

			for (let index = 0; index < pending.length; index++) {
				pending[index].resolve(response.results[index]);
			}
		},
		(error) => {
			for (const item of pending) {
				item.reject(error);
			}
		},
	);
};

export const saveSequenceProps = (
	request: SaveSequencePropsRequest,
): Promise<SaveSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.saveSequenceProps(request)
		: callApi('/api/save-sequence-props', request);
};

export const subscribeToSequenceProps = (
	request: SubscribeToSequencePropsRequest,
): Promise<SubscribeToSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.subscribeToSequenceProps(request);
	}

	return new Promise((resolve, reject) => {
		pendingSequencePropsSubscriptions.push({request, resolve, reject});
		if (sequencePropsSubscriptionTimer === null) {
			sequencePropsSubscriptionTimer = setTimeout(
				flushSequencePropsSubscriptions,
				0,
			);
		}
	});
};

export const unsubscribeFromSequenceProps = (
	request: UnsubscribeFromSequencePropsRequest,
): Promise<undefined> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.unsubscribeFromSequenceProps(request)
		: callApi('/api/unsubscribe-from-sequence-props', request);
};
