import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse,
	DeleteStaticFileRequest,
	DeleteStaticFileResponse,
	FindInFileRequest,
	FindInFileResponse,
	InsertJsxElementRequest,
	InsertJsxElementResponse,
	InsertElementRequest,
	InsertElementResponse,
	PrepareElementInstallRequest,
	PrepareElementInstallResponse,
	RedoResponse,
	RenameStaticFileRequest,
	RenameStaticFileResponse,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SimpleDiff,
	SplitJsxSequenceRequest,
	SplitJsxSequenceResponse,
	SplitVideoFromAudioRequest,
	SplitVideoFromAudioResponse,
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UndoResponse,
	UnsubscribeFromDefaultPropsRequest,
	UnsubscribeFromSequencePropsRequest,
} from './api-requests';
import type {RecastCodemod} from './codemods';
import type {EventSourceEvent} from './event-source-event';

export type WriteStaticFileRequest = {
	contents: string | ArrayBuffer;
	filePath: string;
};

export type DuplicateCompositionRequest = {
	codemod: Extract<RecastCodemod, {type: 'duplicate-composition'}>;
	dryRun: boolean;
};

export type DuplicateCompositionResponse =
	| {
			success: true;
			diff: SimpleDiff;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type BrowserStudioOperations = {
	applyCodemod: (request: ApplyCodemodRequest) => Promise<ApplyCodemodResponse>;
	deleteJsxNode: (
		request: DeleteJsxNodeRequest,
	) => Promise<DeleteJsxNodeResponse>;
	deleteStaticFile: (
		request: DeleteStaticFileRequest,
	) => Promise<DeleteStaticFileResponse>;
	downloadProject: () => Promise<{
		data: Uint8Array;
		fileName: string;
	}>;
	duplicateComposition: (
		request: DuplicateCompositionRequest,
	) => Promise<DuplicateCompositionResponse>;
	findInFile: (request: FindInFileRequest) => Promise<FindInFileResponse>;
	getFileSource: (fileName: string) => Promise<string | null>;
	getCompositionFile: (compositionId: string) => string | null;
	getCompositionComponentInfo: (
		request: CompositionComponentInfoRequest,
	) => Promise<CompositionComponentInfoResponse>;
	insertSolid: (
		request: InsertJsxElementRequest,
	) => Promise<InsertJsxElementResponse>;
	insertElement: (
		request: InsertElementRequest,
	) => Promise<InsertElementResponse>;
	insertJsxElement: (
		request: InsertJsxElementRequest,
	) => Promise<InsertJsxElementResponse>;
	prepareElementInstall: (
		request: PrepareElementInstallRequest,
	) => Promise<PrepareElementInstallResponse>;
	redo: () => Promise<RedoResponse>;
	renameStaticFile: (
		request: RenameStaticFileRequest,
	) => Promise<RenameStaticFileResponse>;
	saveSequenceProps: (
		request: SaveSequencePropsRequest,
	) => Promise<SaveSequencePropsResponse>;
	splitJsxSequence: (
		request: SplitJsxSequenceRequest,
	) => Promise<SplitJsxSequenceResponse>;
	splitVideoFromAudio: (
		request: SplitVideoFromAudioRequest,
	) => Promise<SplitVideoFromAudioResponse>;
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
