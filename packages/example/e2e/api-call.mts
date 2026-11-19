import type {ApiRoutes} from '@remotion/studio-shared';
import {STUDIO_URL} from './constants.mts';
import {nodeFetch} from './node-fetch.mts';

type ApiResponse<Endpoint extends keyof ApiRoutes> =
	| {success: true; data: ApiRoutes[Endpoint]['Response']}
	| {success: false; error: string};

export const apiCall = async <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
): Promise<ApiResponse<Endpoint>> => {
	const res = await nodeFetch(`${STUDIO_URL}${endpoint}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			origin: STUDIO_URL,
		},
		body: JSON.stringify(body),
	});
	return (await res.json()) as ApiResponse<Endpoint>;
};
