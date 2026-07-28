import type {ApiRoutes} from './api-requests';

export type BrowserStudioServer = {
	callApi: <Endpoint extends keyof ApiRoutes>(
		endpoint: Endpoint,
		body: ApiRoutes[Endpoint]['Request'],
	) => Promise<ApiRoutes[Endpoint]['Response']>;
	capabilities: {
		insertSolid: boolean;
	};
};

declare global {
	interface Window {
		remotion_browserStudioServer?: BrowserStudioServer;
	}
}

export const getBrowserStudioServer = (): BrowserStudioServer | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	return window.remotion_browserStudioServer ?? null;
};
