import type {ElementDragData} from '@remotion/studio-protocol';
import type {
	AddEffectKeyframeRequest,
	AddEffectKeyframeResponse,
	AddEffectRequest,
	AddEffectResponse,
	AddKeyframesRequest,
	AddKeyframesResponse,
	AddSequenceKeyframeRequest,
	AddSequenceKeyframeResponse,
	ApplyCodemodRequest,
	ApplyCodemodResponse,
	BatchUpdateKeyframeSettingsRequest,
	BatchUpdateKeyframeSettingsResponse,
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
	DeleteJsxNodeRequest,
	DeleteJsxNodeResponse,
	DeleteKeyframesRequest,
	DeleteKeyframesResponse,
	DeleteEffectRequest,
	DeleteEffectResponse,
	DeleteStaticFileRequest,
	DeleteStaticFileResponse,
	FindInFileRequest,
	FindInFileResponse,
	DuplicateEffectRequest,
	DuplicateEffectResponse,
	InsertJsxElementRequest,
	InsertJsxElementResponse,
	InsertElementRequest,
	InsertElementResponse,
	InstallPackageRequest,
	MoveKeyframesRequest,
	MoveKeyframesResponse,
	PasteEffectsRequest,
	PasteEffectsResponse,
	PrepareElementInstallRequest,
	PrepareElementInstallResponse,
	RedoResponse,
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
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
	UpdateEffectKeyframeSettingsRequest,
	UpdateEffectKeyframeSettingsResponse,
	UpdateSequenceKeyframeSettingsRequest,
	UpdateSequenceKeyframeSettingsResponse,
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
		element: ElementDragData['element'];
		sourceOrigin: string | null;
	} | null;
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
	/** Optional for compatibility with older Browser Studio hosts. */
	effects?: BrowserStudioEffectOperations;
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
	/** Optional for compatibility with older Browser Studio hosts. */
	keyframes?: BrowserStudioKeyframeOperations;
	/** Optional for compatibility with older Browser Studio hosts. */
	packageInstallation?: BrowserStudioPackageInstallationOperations;
	prepareElementInstall: (
		request: PrepareElementInstallRequest,
	) => Promise<PrepareElementInstallResponse>;
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
