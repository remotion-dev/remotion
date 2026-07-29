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
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UndoResponse,
	UnsubscribeFromDefaultPropsRequest,
	UnsubscribeFromSequencePropsRequest,
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
	saveSequenceProps: (
		request: SaveSequencePropsRequest,
	) => Promise<SaveSequencePropsResponse>;
	subscribeToDefaultProps: (
		request: SubscribeToDefaultPropsRequest,
	) => Promise<SubscribeToDefaultPropsResponse>;
	subscribeToSequenceProps: (
		request: SubscribeToSequencePropsRequest,
	) => Promise<SubscribeToSequencePropsResponse>;
	subscribeToEvent: (listener: (event: EventSourceEvent) => void) => () => void;
	undo: () => Promise<UndoResponse>;
	unsubscribeFromDefaultProps: (
		request: UnsubscribeFromDefaultPropsRequest,
	) => Promise<undefined>;
	unsubscribeFromSequenceProps: (
		request: UnsubscribeFromSequencePropsRequest,
	) => Promise<undefined>;
	writeStaticFile: (request: WriteStaticFileRequest) => Promise<void>;
};

declare global {
	interface Window {
		remotion_browserStudio?: BrowserStudioOperations;
	}
}
