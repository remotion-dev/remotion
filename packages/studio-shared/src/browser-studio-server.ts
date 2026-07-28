import type {ApiRoutes} from './api-requests';

export type BrowserStudioServer = {
	callApi: <Endpoint extends keyof ApiRoutes>(
		endpoint: Endpoint,
		body: ApiRoutes[Endpoint]['Request'],
	) => Promise<ApiRoutes[Endpoint]['Response']>;
	capabilities: {
		insertSolid: boolean;
	};
	getCompositionFile: (compositionId: string) => string | null;
};

declare global {
	interface Window {
		remotion_browserStudioServer?: BrowserStudioServer;
	}
}
