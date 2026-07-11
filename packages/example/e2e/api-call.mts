import type {ApiRoutes} from '@remotion/studio-shared';
import {STUDIO_URL} from './constants.mts';

type ApiResponse<Endpoint extends keyof ApiRoutes> =
	| {success: true; data: ApiRoutes[Endpoint]['Response']}
	| {success: false; error: string};

const getStudioAuthToken = async () => {
	const res = await fetch(STUDIO_URL);
	const html = await res.text();
	const match = html.match(
		/window\.remotion_studioAuthToken = ("(?:\\.|[^"\\])*");/,
	);
	if (!match) {
		throw new Error('Could not find Studio authentication token');
	}

	return JSON.parse(match[1]) as string;
};

export const apiCall = async <Endpoint extends keyof ApiRoutes>(
	endpoint: Endpoint,
	body: ApiRoutes[Endpoint]['Request'],
): Promise<ApiResponse<Endpoint>> => {
	const res = await fetch(`${STUDIO_URL}${endpoint}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			origin: STUDIO_URL,
			'x-remotion-studio-token': await getStudioAuthToken(),
		},
		body: JSON.stringify(body),
	});
	return (await res.json()) as ApiResponse<Endpoint>;
};
