import {
	studioOperations,
	type ApiRoutes,
	type SubscribeToSequencePropsBatchRequest,
	type SourceMutationGuard,
} from '@remotion/studio-shared';
import {enqueueStudioSourceMutation} from '../helpers/enqueue-studio-source-mutation';
import {withSequenceSourceRead} from '../helpers/sequence-node-path-mutations';

const callApiImmediately = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	guard: SourceMutationGuard | null,
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	const run = () =>
		new Promise<ApiRoutes[Endpoint]['Response']>((resolve, reject) => {
			fetch(endpoint as string, {
				method: 'post',
				headers: {
					'content-type': 'application/json',
					...(guard === null
						? {}
						: {'x-remotion-source-revision': JSON.stringify(guard)}),
				},
				signal,
				body: JSON.stringify(body),
			})
				.then((res) => res.json())
				.then(
					(
						data:
							| {success: true; data: ApiRoutes[Endpoint]['Response']}
							| {success: false; error: string},
					) => {
						if (data.success) {
							resolve(data.data);
						} else {
							reject(new Error(data.error));
						}
					},
				)
				.catch((err) => {
					reject(err);
				});
		});
	return endpoint === '/api/subscribe-to-sequence-props'
		? withSequenceSourceRead(
				(body as SubscribeToSequencePropsBatchRequest).requests.map(
					(request) => request.fileName,
				),
				run,
			)
		: run();
};

export const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	if (!studioOperations[endpoint].mutatesSource) {
		return callApiImmediately(endpoint, body, null, signal);
	}

	return enqueueStudioSourceMutation(endpoint, body, (rebasedBody, guard) =>
		callApiImmediately(
			endpoint,
			rebasedBody as ApiRoutes[Endpoint]['Request'],
			guard,
			signal,
		),
	);
};
