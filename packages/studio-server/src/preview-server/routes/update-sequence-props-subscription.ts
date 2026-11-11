import type {
	UpdateSequencePropsSubscriptionBatchRequest,
	SubscribeToSequencePropsBatchResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {updateSequencePropsSubscription} from '../sequence-props-watchers';

export const updateSequencePropsSubscriptions: ApiHandler<
	UpdateSequencePropsSubscriptionBatchRequest,
	SubscribeToSequencePropsBatchResponse
> = ({input, remotionRoot}) => {
	const fileContentsCache = new Map<string, string>();
	return Promise.resolve({
		results: input.requests.map((request) =>
			updateSequencePropsSubscription({
				request,
				remotionRoot,
				fileContentsCache,
			}),
		),
	});
};
