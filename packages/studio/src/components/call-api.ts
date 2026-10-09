import {studioOperations, type ApiRoutes} from '@remotion/studio-shared';
import {enqueueStudioSourceMutation} from '../helpers/enqueue-studio-source-mutation';
import {queueSequenceNodePathMutationFromApiResponse} from '../helpers/sequence-node-path-mutations';

const callApiImmediately = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	return new Promise<ApiRoutes[Endpoint]['Response']>((resolve, reject) => {
		fetch(endpoint as string, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
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
						queueSequenceNodePathMutationFromApiResponse(data.data);
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
};

export const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	if (!studioOperations[endpoint].mutatesSource) {
		return callApiImmediately(endpoint, body, signal);
	}

	return enqueueStudioSourceMutation(endpoint, body, () =>
		callApiImmediately(endpoint, body, signal),
	);
};
