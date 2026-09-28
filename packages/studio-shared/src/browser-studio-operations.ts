import type {
	AddEffectKeyframeRequest,
	AddEffectKeyframeResponse,
	AddEffectRequest,
	AddEffectResponse,
	AddCompositionRequest,
	AddFolderRequest,
	AddKeyframesRequest,
	AddKeyframesResponse,
	AddSequenceKeyframeRequest,
	AddSequenceKeyframeResponse,
	BatchUpdateKeyframeSettingsRequest,
	BatchUpdateKeyframeSettingsResponse,
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
	CompositionEditResponse,
	DeleteCompositionRequest,
	DeleteNodesRequest,
	DeleteNodesResponse,
	DeleteKeyframesRequest,
	DeleteKeyframesResponse,
	DeleteEffectRequest,
	DeleteEffectResponse,
	DeleteStaticFileRequest,
	DeleteStaticFileResponse,
	DownloadRemoteAssetRequest,
	DownloadRemoteAssetResponse,
	FindInFileRequest,
	FindInFileResponse,
	DuplicateEffectRequest,
	DuplicateEffectResponse,
	DuplicateCompositionRequest,
	PrecomposeJsxNodesRequest,
	PrecomposeJsxNodesResponse,
	DuplicateNodesRequest,
	DuplicateNodesResponse,
	WrapNodeRequest,
	WrapNodeResponse,
	InsertCompositionElementRequest,
	InsertCompositionElementResponse,
	InsertElementRequest,
	InsertElementResponse,
	InstallPackageRequest,
	InstallableElement,
	MoveKeyframesRequest,
	MoveKeyframesResponse,
	MoveCompositionRequest,
	MoveFolderRequest,
	PasteEffectsRequest,
	PasteEffectsResponse,
	PrepareElementInstallRequest,
	PrepareElementInstallResponse,
	RedoResponse,
	RenameCompositionRequest,
	RenameFolderRequest,
	RenameStaticFileRequest,
	RenameStaticFileResponse,
	ReorderEffectRequest,
	ReorderEffectResponse,
	ReorderSequenceRequest,
	ReorderSequenceResponse,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveEffectPropsRequest,
	SaveEffectPropsResponse,
	SaveMultipleEffectPropsRequest,
	SaveMultipleEffectPropsResponse,
	SplitSequencesRequest,
	SplitSequencesResponse,
	SplitVideoFromAudioRequest,
	SplitVideoFromAudioResponse,
	InsertBasicCaptionsRequest,
	InsertBasicCaptionsResponse,
	ReplaceVideoSourceRequest,
	ReplaceVideoSourceResponse,
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UndoResponse,
	UnsubscribeFromDefaultPropsRequest,
	UnsubscribeFromSequencePropsRequest,
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
	UpdateCompositionMetadataRequest,
	UpdateEffectKeyframeSettingsRequest,
	UpdateEffectKeyframeSettingsResponse,
	UpdateSequenceKeyframeSettingsRequest,
	UpdateSequenceKeyframeSettingsResponse,
	UnwrapFolderRequest,
} from './api-requests';
import type {EventSourceEvent} from './event-source-event';

export type WriteStaticFileRequest = {
	contents: string | ArrayBuffer;
	filePath: string;
};

export type BrowserStudioKeyframeOperations = {
	addEffectKeyframe: (
		request: AddEffectKeyframeRequest,
	) => Promise<AddEffectKeyframeResponse>;
	addKeyframes: (request: AddKeyframesRequest) => Promise<AddKeyframesResponse>;
	addSequenceKeyframe: (
		request: AddSequenceKeyframeRequest,
	) => Promise<AddSequenceKeyframeResponse>;
	batchUpdateKeyframeSettings: (
		request: BatchUpdateKeyframeSettingsRequest,
	) => Promise<BatchUpdateKeyframeSettingsResponse>;
	deleteKeyframes: (
		request: DeleteKeyframesRequest,
	) => Promise<DeleteKeyframesResponse>;
	moveKeyframes: (
		request: MoveKeyframesRequest,
	) => Promise<MoveKeyframesResponse>;
	updateEffectKeyframeSettings: (
		request: UpdateEffectKeyframeSettingsRequest,
	) => Promise<UpdateEffectKeyframeSettingsResponse>;
	updateSequenceKeyframeSettings: (
		request: UpdateSequenceKeyframeSettingsRequest,
	) => Promise<UpdateSequenceKeyframeSettingsResponse>;
};

export type BrowserStudioEffectOperations = {
	addEffect: (request: AddEffectRequest) => Promise<AddEffectResponse>;
	deleteEffects: (
		request: DeleteEffectRequest,
	) => Promise<DeleteEffectResponse>;
	duplicateEffects: (
		request: DuplicateEffectRequest,
	) => Promise<DuplicateEffectResponse>;
	pasteEffects: (request: PasteEffectsRequest) => Promise<PasteEffectsResponse>;
	reorderEffect: (
		request: ReorderEffectRequest,
	) => Promise<ReorderEffectResponse>;
	saveEffectProps: (
		request: SaveEffectPropsRequest,
	) => Promise<SaveEffectPropsResponse>;
	saveMultipleEffectProps: (
		request: SaveMultipleEffectPropsRequest,
	) => Promise<SaveMultipleEffectPropsResponse>;
};

export type BrowserStudioInstallPackagesResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type BrowserStudioPackageInstallationOperations = {
	installPackages: (
		request: InstallPackageRequest,
	) => Promise<BrowserStudioInstallPackagesResponse>;
};

export type BrowserStudioOperations = {
	consumeInitialElement: () => {
		element: InstallableElement;
		sourceOrigin: string | null;
	} | null;
	addComposition: (
		request: AddCompositionRequest,
	) => Promise<CompositionEditResponse>;
	addFolder: (request: AddFolderRequest) => Promise<CompositionEditResponse>;
	deleteComposition: (
		request: DeleteCompositionRequest,
	) => Promise<CompositionEditResponse>;
	deleteNodes: (request: DeleteNodesRequest) => Promise<DeleteNodesResponse>;
	deleteStaticFile: (
		request: DeleteStaticFileRequest,
	) => Promise<DeleteStaticFileResponse>;
	downloadProject: () => Promise<{
		data: Uint8Array;
		fileName: string;
	}>;
	downloadRemoteAsset: (
		request: DownloadRemoteAssetRequest,
	) => Promise<DownloadRemoteAssetResponse>;
	duplicateComposition: (
		request: DuplicateCompositionRequest,
	) => Promise<CompositionEditResponse>;
	precomposeJsxNodes: (
		request: PrecomposeJsxNodesRequest,
	) => Promise<PrecomposeJsxNodesResponse>;
	duplicateNodes: (
		request: DuplicateNodesRequest,
	) => Promise<DuplicateNodesResponse>;
	wrapNode: (request: WrapNodeRequest) => Promise<WrapNodeResponse>;
	effects: BrowserStudioEffectOperations;
	findInFile: (request: FindInFileRequest) => Promise<FindInFileResponse>;
	getFileSource: (fileName: string) => Promise<string | null>;
	getCompositionFile: (compositionId: string) => string | null;
	getCompositionComponentInfo: (
		request: CompositionComponentInfoRequest,
	) => Promise<CompositionComponentInfoResponse>;
	insertElement: (
		request: InsertElementRequest,
	) => Promise<InsertElementResponse>;
	insertCompositionElement: (
		request: InsertCompositionElementRequest,
	) => Promise<InsertCompositionElementResponse>;
	moveComposition: (
		request: MoveCompositionRequest,
	) => Promise<CompositionEditResponse>;
	moveFolder: (request: MoveFolderRequest) => Promise<CompositionEditResponse>;
	keyframes: BrowserStudioKeyframeOperations;
	packageInstallation: BrowserStudioPackageInstallationOperations;
	prepareElementInstall: (
		request: PrepareElementInstallRequest,
	) => Promise<PrepareElementInstallResponse>;
	renameComposition: (
		request: RenameCompositionRequest,
	) => Promise<CompositionEditResponse>;
	renameFolder: (
		request: RenameFolderRequest,
	) => Promise<CompositionEditResponse>;
	unwrapFolder: (
		request: UnwrapFolderRequest,
	) => Promise<CompositionEditResponse>;
	updateCompositionMetadata: (
		request: UpdateCompositionMetadataRequest,
	) => Promise<CompositionEditResponse>;
	redo: () => Promise<RedoResponse>;
	renameStaticFile: (
		request: RenameStaticFileRequest,
	) => Promise<RenameStaticFileResponse>;
	reorderSequence: (
		request: ReorderSequenceRequest,
	) => Promise<ReorderSequenceResponse>;
	saveSequenceProps: (
		request: SaveSequencePropsRequest,
	) => Promise<SaveSequencePropsResponse>;
	splitSequences: (
		request: SplitSequencesRequest,
	) => Promise<SplitSequencesResponse>;
	splitVideoFromAudio: (
		request: SplitVideoFromAudioRequest,
	) => Promise<SplitVideoFromAudioResponse>;
	insertBasicCaptions: (
		request: InsertBasicCaptionsRequest,
	) => Promise<InsertBasicCaptionsResponse>;
	replaceVideoSource?: (
		request: ReplaceVideoSourceRequest,
	) => Promise<ReplaceVideoSourceResponse>;
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
	updateDefaultProps: (
		request: UpdateDefaultPropsRequest,
	) => Promise<UpdateDefaultPropsResponse>;
	writeStaticFile: (request: WriteStaticFileRequest) => Promise<void>;
};

declare global {
	interface Window {
		remotion_browserStudio?: BrowserStudioOperations;
	}
}
