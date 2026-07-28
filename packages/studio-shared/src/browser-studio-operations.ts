import type {
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
	InsertJsxElementRequest,
	InsertJsxElementResponse,
} from './api-requests';

export type BrowserStudioOperations = {
	downloadProject?: () => Promise<{
		data: Uint8Array;
		fileName: string;
	}>;
	getCompositionFile: (compositionId: string) => string | null;
	getCompositionComponentInfo: (
		request: CompositionComponentInfoRequest,
	) => Promise<CompositionComponentInfoResponse>;
	insertSolid: (
		request: InsertJsxElementRequest,
	) => Promise<InsertJsxElementResponse>;
};

declare global {
	interface Window {
		remotion_browserStudio?: BrowserStudioOperations;
	}
}
