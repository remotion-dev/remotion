import type {
	AudioCodec,
	ChromeMode,
	Codec,
	ColorSpace,
	LogLevel,
	PixelFormat,
	StillImageFormat,
	VideoImageFormat,
	X264Preset,
} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import type {
	_InternalTypes,
	CannotUpdateSequenceReason,
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropsResponseFalse,
	CanUpdateSequencePropsResponseTrue,
	CanUpdateSequencePropStatus,
	ExtrapolateType,
	InteractivitySchema,
	JsxComponentIdentity,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import type {RecastCodemod, VisualControlChange} from './codemods';
import type {ComponentProp} from './component-drag-data';
import type {
	EffectClipboardParam,
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from './effect-clipboard-data';
import type {ElementDragData} from './element-drag-data';
import type {PackageManager} from './package-manager';
import type {ProjectInfo} from './project-info';
import type {
	CompletedClientRender,
	RequiredChromiumOptions,
} from './render-job';
import type {SymbolicatedStackFrame} from './stack-types';
import type {EnumPath} from './stringify-default-props';

type KeyframeEasing = Extract<
	CanUpdateSequencePropStatus,
	{status: 'keyframed'}
>['easing'][number];

export type OpenInFileExplorerRequest = {
	directory: string;
};

export type OpenInEditorRequest = {
	stack: SymbolicatedStackFrame;
};

export type OpenInEditorResponse = {
	success: boolean;
};

export type CompositionComponentInfoRequest = {
	compositionFile: string;
	compositionId: string;
};

export type CompositionComponentInfoResponse = {
	location: {
		source: string;
		line: number;
		column: number;
	};
	canAddSequence: boolean;
};

export type CopyStillToClipboardRequest = {
	outName: string;
	binariesDirectory: string | null;
};

type ReqAndRes<A, B> = {
	Request: A;
	Response: B;
};

type AddRenderRequestDynamicFields =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			jpegQuality: number;
			frame: number;
			scale: number;
			logLevel: LogLevel;
			chromeMode: ChromeMode;
	  }
	| {
			type: 'sequence';
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			logLevel: LogLevel;
			concurrency: number;
			startFrame: number;
			endFrame: number;
			disallowParallelEncoding: boolean;
			repro: boolean;
			chromeMode: ChromeMode;
	  }
	| {
			type: 'video';
			codec: Codec;
			audioCodec: AudioCodec;
			imageFormat: VideoImageFormat;
			jpegQuality: number | null;
			scale: number;
			logLevel: LogLevel;
			concurrency: number;
			crf: number | null;
			gopSize: number | null;
			startFrame: number;
			endFrame: number;
			muted: boolean;
			enforceAudioTrack: boolean;
			proResProfile: _InternalTypes['ProResProfile'] | null;
			x264Preset: X264Preset | null;
			pixelFormat: PixelFormat;
			audioBitrate: string | null;
			videoBitrate: string | null;
			encodingBufferSize: string | null;
			encodingMaxRate: string | null;
			everyNthFrame: number;
			numberOfGifLoops: number | null;
			disallowParallelEncoding: boolean;
			colorSpace: ColorSpace;
			repro: boolean;
			forSeamlessAacConcatenation: boolean;
			separateAudioTo: string | null;
			hardwareAcceleration: HardwareAccelerationOption;
			chromeMode: ChromeMode;
			sampleRate: number;
	  };

export type CancelRenderRequest = {
	jobId: string;
};
export type CancelRenderResponse = {};

export type AddRenderRequest = {
	compositionId: string;
	outName: string;
	chromiumOptions: RequiredChromiumOptions;
	delayRenderTimeout: number;
	envVariables: Record<string, string>;
	serializedInputPropsWithCustomSchema: string;
	offthreadVideoCacheSizeInBytes: number | null;
	offthreadVideoThreads: number | null;
	mediaCacheSizeInBytes: number | null;
	multiProcessOnLinux: boolean;
	beepOnFinish: boolean;
	metadata: Record<string, string> | null;
} & AddRenderRequestDynamicFields;

export type RemoveRenderRequest = {
	jobId: string;
};

export type SubscribeToFileExistenceRequest = {
	file: string;
	clientId: string;
};

export type SubscribeToFileExistenceResponse = {
	exists: boolean;
};

export type UnsubscribeFromFileExistenceRequest = {
	file: string;
	clientId: string;
};

export type UpdateDefaultPropsRequest = {
	compositionId: string;
	defaultProps: string;
	enumPaths: EnumPath[];
};

export type ApplyVisualControlRequest = {
	fileName: string;
	changes: VisualControlChange[];
};

export type ApplyVisualControlResponse = {
	success: true;
};

export type UpdateDefaultPropsResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type ApplyCodemodRequest = {
	codemod: RecastCodemod;
	dryRun: boolean;
	symbolicatedStack: SymbolicatedStackFrame | null;
};

export type SimpleDiff = {
	additions: number;
	deletions: number;
};

export type ApplyCodemodResponse =
	| {
			success: true;
			diff: SimpleDiff;
	  }
	| {
			success: false;
			reason: string;
	  };

export type DeleteStaticFileRequest = {
	relativePath: string;
};

export type DeleteStaticFileResponse = {
	success: boolean;
	existed: boolean;
};

export type RenameStaticFileRequest = {
	oldRelativePath: string;
	newRelativePath: string;
};

export type RenameStaticFileResponse = {
	success: boolean;
};

export type CanUpdateDefaultPropsResponse =
	| {
			canUpdate: true;
			currentDefaultProps: Record<string, unknown>;
	  }
	| {
			canUpdate: false;
			reason: string;
	  };

export type SubscribeToDefaultPropsRequest = {
	compositionId: string;
	clientId: string;
};

export type SubscribeToDefaultPropsResponse = CanUpdateDefaultPropsResponse;

export type UnsubscribeFromDefaultPropsRequest = {
	compositionId: string;
	clientId: string;
};

export type CanUpdateSequencePropsRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	keys: string[];
};

export type SubscribeToSequencePropsRequest = {
	fileName: string;
	line: number;
	column: number;
	nodePath: SequenceNodePath | null;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
	clientId: string;
};

export type SubscribeToSequencePropsResponse =
	| {
			success: true;
			status: CanUpdateSequencePropsResponseTrue;
			nodePath: SequencePropsSubscriptionKey;
	  }
	| {
			success: false;
			status: CanUpdateSequencePropsResponseFalse;
	  };

export type UnsubscribeFromSequencePropsRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	clientId: string;
	sequenceKeys: string[];
	effectKeys: string[][];
};

export type GoogleFontSourceEdit = {
	fontFamily: string;
	importName: string;
	style: string;
	weights: string[];
	subsets: string[];
};

export type SaveSequencePropSourceEdit = {
	type: 'google-font';
	font: GoogleFontSourceEdit;
};

export type SaveSequencePropEdit = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	value:
		| {
				type: 'json';
				serialized: string;
		  }
		| {
				type: 'undefined';
		  };
	defaultValue: string | null;
	schema: InteractivitySchema;
	sourceEdit: SaveSequencePropSourceEdit | null;
};

export type SaveSequencePropsRequest = {
	edits: SaveSequencePropEdit[];
	movedKeyframes?: {
		sequenceKeyframes: MoveSequenceKeyframe[];
		effectKeyframes: MoveEffectKeyframe[];
	};
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

export type SaveSequencePropsResult = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	props: Record<string, CanUpdateSequencePropStatus>;
};

export type SaveSequencePropsResponse =
	| {
			canUpdate: true;
			props: Record<string, CanUpdateSequencePropStatus>;
			results: SaveSequencePropsResult[];
	  }
	| {
			canUpdate: false;
			reason: CannotUpdateSequenceReason;
	  };

type SaveEffectPropsRequestBase = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	defaultValue: string | null;
	schema: InteractivitySchema;
	clientId: string;
};

export type SaveEffectPropsRequest =
	| (SaveEffectPropsRequestBase & {
			type: 'value';
			value: string;
	  })
	| (SaveEffectPropsRequestBase & {
			type: 'effect-param';
			effectParam: EffectClipboardParam;
	  });

export type SaveEffectPropsResponse = CanUpdateEffectPropsResponse;

export type AddEffectRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectName: string;
	effectImportPath: string;
	effectConfig: Record<string, unknown>;
	clientId: string;
};

export type AddEffectResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type ReorderEffectRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	fromIndex: number;
	toIndex: number;
	clientId: string;
};

export type ReorderEffectResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type DuplicateEffectRequestItem = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
};

export type DuplicateEffectRequest = DuplicateEffectRequestItem[];

export type DuplicateEffectResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type ReorderSequencePosition = 'before' | 'after';

export type ReorderSequenceRequest = {
	fileName: string;
	sourceNodePath: SequencePropsSubscriptionKey;
	targetNodePath: SequencePropsSubscriptionKey;
	position: ReorderSequencePosition;
	clientId: string;
};

export type ReorderSequenceResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type DeleteSequenceKeyframe = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	frame: number;
	schema: InteractivitySchema;
};

export type MoveSequenceKeyframe = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	fromFrame: number;
	toFrame: number;
	schema: InteractivitySchema;
};

export type AddSequenceKeyframeRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	frame: number;
	value: string;
	schema: InteractivitySchema;
	clientId: string;
};

export type AddSequenceKeyframeResponse = SaveSequencePropsResponse;

export type AddSequenceKeyframe = Omit<AddSequenceKeyframeRequest, 'clientId'>;

export type DeleteEffectKeyframe = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	frame: number;
	schema: InteractivitySchema;
};

export type MoveEffectKeyframe = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	fromFrame: number;
	toFrame: number;
	schema: InteractivitySchema;
};

export type DeleteKeyframesRequest = {
	sequenceKeyframes: DeleteSequenceKeyframe[];
	effectKeyframes: DeleteEffectKeyframe[];
	clientId: string;
};

export type DeleteKeyframesResponse = {
	success: true;
};

export type MoveKeyframesRequest = {
	sequenceKeyframes: MoveSequenceKeyframe[];
	effectKeyframes: MoveEffectKeyframe[];
	clientId: string;
};

export type MoveKeyframesResponse = {
	success: true;
};

export type AddEffectKeyframeRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	frame: number;
	value: string;
	schema: InteractivitySchema;
	clientId: string;
};

export type AddEffectKeyframeResponse = SaveEffectPropsResponse;

export type AddEffectKeyframe = Omit<AddEffectKeyframeRequest, 'clientId'>;

export type AddKeyframesRequest = {
	sequenceKeyframes: AddSequenceKeyframe[];
	effectKeyframes: AddEffectKeyframe[];
	clientId: string;
};

export type AddKeyframesResponse = {
	success: true;
};

export type KeyframeSettings =
	| {
			type: 'settings';
			clamping:
				| {
						left: ExtrapolateType;
						right: ExtrapolateType;
				  }
				| undefined;
			posterize: number | undefined;
	  }
	| {
			type: 'easing';
			segmentIndex: number;
			easing: KeyframeEasing;
	  };

export type UpdateSequenceKeyframeSettingsRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	settings: KeyframeSettings;
	schema: InteractivitySchema;
	clientId: string;
};

export type UpdateSequenceKeyframeSettingsResponse = SaveSequencePropsResponse;

export type UpdateEffectKeyframeSettingsRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	settings: KeyframeSettings;
	schema: InteractivitySchema;
	clientId: string;
};

export type UpdateEffectKeyframeSettingsResponse = SaveEffectPropsResponse;

type BaseDeleteEffectRequestItem = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
};

export type DeleteEffectRequestItem =
	| (BaseDeleteEffectRequestItem & {
			type: 'single-effect';
			effectIndex: number;
	  })
	| (BaseDeleteEffectRequestItem & {
			type: 'all-effects';
	  });

export type DeleteEffectRequest = DeleteEffectRequestItem[];

export type DeleteEffectResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type PasteEffectsRequest = {
	targetFileName: string;
	targetSequenceNodePath: SequencePropsSubscriptionKey;
	type: EffectClipboardPasteType;
	effects: EffectClipboardSnapshot[];
	clientId: string;
};

export type PasteEffectsResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type DeleteJsxNodeRequestItem = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type DeleteJsxNodeRequest = {
	nodes: DeleteJsxNodeRequestItem[];
};

export type DeleteJsxNodeResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type DuplicateJsxNodeRequest = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type DuplicateJsxNodeResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type SplitJsxSequenceRequest = {
	fileName: string;
	nodePath: SequenceNodePath;
	splitFrame: number;
};

export type SplitJsxSequenceResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type InsertableCompositionElement =
	| {
			type: 'solid';
			width: number;
			height: number;
			position: InsertableCompositionElementPosition | null;
	  }
	| {
			type: 'component';
			componentName: string;
			importName: string;
			importPath: string;
			props: ComponentProp[];
			position: InsertableCompositionElementPosition | null;
	  }
	| {
			type: 'asset';
			assetType: 'image' | 'video' | 'gif' | 'animated-image' | 'audio';
			src: string;
			srcType: 'static' | 'remote';
			dimensions: {
				width: number;
				height: number;
			} | null;
			position: InsertableCompositionElementPosition | null;
	  }
	| {
			type: 'composition';
			compositionId: string;
			compositionFile: string;
			durationInFrames: number;
			width: number;
			height: number;
			serializedResolvedPropsWithCustomSchema: string;
			position: InsertableCompositionElementPosition | null;
	  };

export type InsertableCompositionElementPosition = {
	x: number;
	y: number;
};

export type InsertJsxElementRequest = {
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
};

export type InsertJsxElementResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type InsertElementRequest = {
	compositionFile: string;
	compositionId: string;
	element: ElementDragData['element'];
	position: InsertableCompositionElementPosition | null;
};

export type InsertElementResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type ElementInstallRequest = {
	id: string;
	clientId: string;
	createdAt: number;
	compositionFile: string;
	compositionId: string;
	element: ElementDragData['element'];
	position: InsertableCompositionElementPosition | null;
};

export type UpdateElementInstallTargetRequest = {
	requestId: string | null;
	clientId: string;
	compositionFile: string | null;
	compositionId: string | null;
	canInstall: boolean;
	lastFocusedAt: number | null;
	readOnly: boolean;
};

export type UpdateElementInstallTargetResponse = {};

export type DownloadRemoteAssetRequest = {
	url: string;
};

export type DownloadRemoteAssetResponse = {
	assetPath: string;
	sizeInBytes: number;
	created: boolean;
	element: InsertableCompositionElement;
};

export type UpdateAvailableRequest = {};
export type UpdateAvailableResponse = {
	currentVersion: string;
	latestVersion: string;
	updateAvailable: boolean;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};

export type ProjectInfoRequest = {};
export type ProjectInfoResponse = {
	projectInfo: ProjectInfo;
};

export type RestartStudioRequest = {};
export type RestartStudioResponse = {};

export type InstallPackageRequest = {
	packageNames: string[];
};
export type InstallPackageResponse = {};

export type UndoRequest = {};
export type UndoResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
	  };

export type RedoRequest = {};
export type RedoResponse =
	| {
			success: true;
	  }
	| {
			success: false;
			reason: string;
	  };

export type LogStudioErrorRequest = {
	name: string | null;
	message: string;
	stack: string | null;
	symbolicatedStackFrames: SymbolicatedStackFrame[] | null;
};
export type LogStudioErrorResponse = {};

export type ApiRoutes = {
	'/api/composition-component-info': ReqAndRes<
		CompositionComponentInfoRequest,
		CompositionComponentInfoResponse
	>;
	'/api/cancel': ReqAndRes<CancelRenderRequest, CancelRenderResponse>;
	'/api/render': ReqAndRes<AddRenderRequest, undefined>;
	'/api/unsubscribe-from-file-existence': ReqAndRes<
		UnsubscribeFromFileExistenceRequest,
		undefined
	>;
	'/api/subscribe-to-file-existence': ReqAndRes<
		SubscribeToFileExistenceRequest,
		SubscribeToFileExistenceResponse
	>;
	'/api/remove-render': ReqAndRes<RemoveRenderRequest, undefined>;
	'/api/open-in-editor': ReqAndRes<OpenInEditorRequest, OpenInEditorResponse>;
	'/api/open-in-file-explorer': ReqAndRes<OpenInFileExplorerRequest, void>;
	'/api/register-client-render': ReqAndRes<CompletedClientRender, void>;
	'/api/unregister-client-render': ReqAndRes<{id: string}, void>;
	'/api/update-default-props': ReqAndRes<
		UpdateDefaultPropsRequest,
		UpdateDefaultPropsResponse
	>;
	'/api/apply-visual-control-change': ReqAndRes<
		ApplyVisualControlRequest,
		ApplyVisualControlResponse
	>;
	'/api/subscribe-to-default-props': ReqAndRes<
		SubscribeToDefaultPropsRequest,
		SubscribeToDefaultPropsResponse
	>;
	'/api/unsubscribe-from-default-props': ReqAndRes<
		UnsubscribeFromDefaultPropsRequest,
		undefined
	>;
	'/api/subscribe-to-sequence-props': ReqAndRes<
		SubscribeToSequencePropsRequest,
		SubscribeToSequencePropsResponse
	>;
	'/api/unsubscribe-from-sequence-props': ReqAndRes<
		UnsubscribeFromSequencePropsRequest,
		undefined
	>;
	'/api/save-sequence-props': ReqAndRes<
		SaveSequencePropsRequest,
		SaveSequencePropsResponse
	>;
	'/api/save-effect-props': ReqAndRes<
		SaveEffectPropsRequest,
		SaveEffectPropsResponse
	>;
	'/api/add-effect': ReqAndRes<AddEffectRequest, AddEffectResponse>;
	'/api/reorder-effect': ReqAndRes<ReorderEffectRequest, ReorderEffectResponse>;
	'/api/duplicate-effect': ReqAndRes<
		DuplicateEffectRequest,
		DuplicateEffectResponse
	>;
	'/api/reorder-sequence': ReqAndRes<
		ReorderSequenceRequest,
		ReorderSequenceResponse
	>;
	'/api/delete-keyframes': ReqAndRes<
		DeleteKeyframesRequest,
		DeleteKeyframesResponse
	>;
	'/api/move-keyframes': ReqAndRes<MoveKeyframesRequest, MoveKeyframesResponse>;
	'/api/add-sequence-keyframe': ReqAndRes<
		AddSequenceKeyframeRequest,
		AddSequenceKeyframeResponse
	>;
	'/api/add-effect-keyframe': ReqAndRes<
		AddEffectKeyframeRequest,
		AddEffectKeyframeResponse
	>;
	'/api/add-keyframes': ReqAndRes<AddKeyframesRequest, AddKeyframesResponse>;
	'/api/update-sequence-keyframe-settings': ReqAndRes<
		UpdateSequenceKeyframeSettingsRequest,
		UpdateSequenceKeyframeSettingsResponse
	>;
	'/api/update-effect-keyframe-settings': ReqAndRes<
		UpdateEffectKeyframeSettingsRequest,
		UpdateEffectKeyframeSettingsResponse
	>;
	'/api/delete-effect': ReqAndRes<DeleteEffectRequest, DeleteEffectResponse>;
	'/api/paste-effects': ReqAndRes<PasteEffectsRequest, PasteEffectsResponse>;
	'/api/delete-jsx-node': ReqAndRes<
		DeleteJsxNodeRequest,
		DeleteJsxNodeResponse
	>;
	'/api/duplicate-jsx-node': ReqAndRes<
		DuplicateJsxNodeRequest,
		DuplicateJsxNodeResponse
	>;
	'/api/split-jsx-sequence': ReqAndRes<
		SplitJsxSequenceRequest,
		SplitJsxSequenceResponse
	>;
	'/api/insert-jsx-element': ReqAndRes<
		InsertJsxElementRequest,
		InsertJsxElementResponse
	>;
	'/api/insert-element': ReqAndRes<InsertElementRequest, InsertElementResponse>;
	'/api/update-element-install-target': ReqAndRes<
		UpdateElementInstallTargetRequest,
		UpdateElementInstallTargetResponse
	>;
	'/api/download-remote-asset': ReqAndRes<
		DownloadRemoteAssetRequest,
		DownloadRemoteAssetResponse
	>;
	'/api/update-available': ReqAndRes<
		UpdateAvailableRequest,
		UpdateAvailableResponse
	>;
	'/api/apply-codemod': ReqAndRes<ApplyCodemodRequest, ApplyCodemodResponse>;
	'/api/project-info': ReqAndRes<ProjectInfoRequest, ProjectInfoResponse>;
	'/api/delete-static-file': ReqAndRes<
		DeleteStaticFileRequest,
		DeleteStaticFileResponse
	>;
	'/api/rename-static-file': ReqAndRes<
		RenameStaticFileRequest,
		RenameStaticFileResponse
	>;
	'/api/restart-studio': ReqAndRes<RestartStudioRequest, RestartStudioResponse>;
	'/api/install-package': ReqAndRes<
		InstallPackageRequest,
		InstallPackageResponse
	>;
	'/api/undo': ReqAndRes<UndoRequest, UndoResponse>;
	'/api/redo': ReqAndRes<RedoRequest, RedoResponse>;
	'/api/log-studio-error': ReqAndRes<
		LogStudioErrorRequest,
		LogStudioErrorResponse
	>;
};
