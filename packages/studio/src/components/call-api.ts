import {STUDIO_CSRF_HEADER, type ApiRoutes} from '@remotion/studio-shared';
import {queueSequenceNodePathMutationFromApiResponse} from '../helpers/sequence-node-path-mutations';

export const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	return new Promise<ApiRoutes[Endpoint]['Response']>((resolve, reject) => {
		fetch(endpoint as string, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
				...(typeof window.remotion_studioCsrfToken === 'string'
					? {
							[STUDIO_CSRF_HEADER]: window.remotion_studioCsrfToken,
						}
					: {}),
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
