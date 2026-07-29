import type {
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
	DeleteStaticFileRequest,
	DeleteStaticFileResponse,
	FindInFileRequest,
	FindInFileResponse,
	InsertJsxElementRequest,
	InsertJsxElementResponse,
	RedoResponse,
	RenameStaticFileRequest,
	RenameStaticFileResponse,
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
	UndoResponse,
	UnsubscribeFromDefaultPropsRequest,
} from './api-requests';
import type {EventSourceEvent} from './event-source-event';

export type WriteStaticFileRequest = {
	contents: string | ArrayBuffer;
	filePath: string;
};

export type BrowserStudioOperations = {
	deleteStaticFile: (
		request: DeleteStaticFileRequest,
	) => Promise<DeleteStaticFileResponse>;
	downloadProject: () => Promise<{
		data: Uint8Array;
		fileName: string;
	}>;
	findInFile: (request: FindInFileRequest) => Promise<FindInFileResponse>;
	getFileSource: (fileName: string) => Promise<string | null>;
	getCompositionFile: (compositionId: string) => string | null;
	getCompositionComponentInfo: (
		request: CompositionComponentInfoRequest,
	) => Promise<CompositionComponentInfoResponse>;
	insertSolid: (
		request: InsertJsxElementRequest,
	) => Promise<InsertJsxElementResponse>;
	redo: () => Promise<RedoResponse>;
	renameStaticFile: (
		request: RenameStaticFileRequest,
	) => Promise<RenameStaticFileResponse>;
	subscribeToDefaultProps: (
		request: SubscribeToDefaultPropsRequest,
	) => Promise<SubscribeToDefaultPropsResponse>;
	subscribeToEvent: (listener: (event: EventSourceEvent) => void) => () => void;
	undo: () => Promise<UndoResponse>;
	unsubscribeFromDefaultProps: (
		request: UnsubscribeFromDefaultPropsRequest,
	) => Promise<undefined>;
	writeStaticFile: (request: WriteStaticFileRequest) => Promise<void>;
};

declare global {
	interface Window {
		remotion_browserStudio?: BrowserStudioOperations;
	}
}
