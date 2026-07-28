import {type ApiRoutes, getBrowserStudioServer} from '@remotion/studio-shared';

export const callApi = <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
	signal?: AbortSignal,
): Promise<ApiRoutes[Endpoint]['Response']> => {
	const browserStudioServer = getBrowserStudioServer();
	if (browserStudioServer) {
		return browserStudioServer.callApi(endpoint, body);
	}

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
