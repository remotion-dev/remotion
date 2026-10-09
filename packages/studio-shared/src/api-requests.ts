import type {
	AudioCodec,
	BuiltInEditor,
	ChromeMode,
	Codec,
	ColorSpace,
	DefaultCodingAgent,
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
	CanUpdateSequencePropSource,
	ExtrapolateType,
	InteractivitySchema,
	InterpolateOutputOption,
	JsxComponentIdentity,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	VideoConfigValues,
} from 'remotion';
import type {
	CompositionDestination,
	NewCompositionOptions,
	VisualControlChange,
} from './codemods';
import type {
	EffectClipboardParam,
	EffectClipboardPasteType,
	EffectClipboardSnapshot,
} from './effect-clipboard-data';
import type {GitClientId} from './git-client';
import type {PackageManager} from './package-manager';
import type {ProjectInfo} from './project-info';
import type {
	CompletedClientRender,
	RequiredChromiumOptions,
} from './render-job';
import type {SequenceNodePathMutation} from './sequence-node-path-mutation';
import type {SymbolicatedStackFrame} from './stack-types';
import type {EnumPath} from './stringify-default-props';
import type {TerminalId} from './terminal';

export type ComponentPropValue =
	| string
	| number
	| boolean
	| null
	| readonly ComponentPropValue[]
	| Readonly<object>;

export type ComponentProp = {
	name: string;
	value: ComponentPropValue;
};

export type EffectConfigValue =
	| string
	| number
	| boolean
	| null
	| EffectConfig
	| readonly EffectConfigValue[];

export type EffectConfig = {
	readonly [key: string]: EffectConfigValue;
};

export type EffectDefinition = {
	readonly name: string;
	readonly importPath: string;
	readonly config: EffectConfig;
};

export type ElementInstallationMode = 'wrapped' | 'component-owned-sequence';

export type ElementDependency =
	| {
			readonly name: `@remotion/${string}`;
			readonly version: null;
	  }
	| {
			readonly name: string;
			readonly version: string;
	  };

export type InstallableElement = {
	assets: Array<
		| {path: string; type: 'url'; url: string}
		| {path: string; type: 'base64'; data: string}
	>;
	dependencies: ElementDependency[];
	durationInFrames: number | null;
	initialProps: Readonly<Record<string, ComponentPropValue>> | null;
	installationMode: ElementInstallationMode | null;
	isCaptionStyle: boolean;
	slug: string;
	displayName: string;
	sourceCode: string;
	dimensions: {
		height: number;
		width: number;
	} | null;
};

type KeyframeEasing = Extract<
	CanUpdateSequencePropStatus,
	{status: 'keyframed'}
>['easing'][number];

export type OpenInFileExplorerRequest = {
	directory: string;
};

export type OpenInEditorRequest = {
	editorId: EditorPickerId | null;
	stack: SymbolicatedStackFrame;
};

export type OpenInEditorResponse = {
	success: boolean;
};

export type OpenInCodingAgentRequest = {
	codingAgentId: DefaultCodingAgent;
	prompt: string | null;
};

export type OpenInCodingAgentResponse = {
	success: boolean;
};

export type OpenInTerminalRequest = {
	directory: string;
	terminalId: TerminalId;
};

export type OpenInTerminalResponse = {
	success: boolean;
};

export type OpenInGitClientRequest = {
	gitClientId: GitClientId;
};

export type OpenInGitClientResponse = {
	success: boolean;
};

export type FindInFileRequest = {
	fileName: string;
	lineNumber: number;
	columnNumber: number;
	search: string;
};

export type FindInFileResponse = {
	lineNumber: number;
	columnNumber: number;
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

class StudioOperation<Request, Response> {
	// Type-only fields keep request/response contracts on the operation definition.
	declare readonly Request: Request;
	declare readonly Response: Response;
	readonly mutatesSource: boolean;

	constructor({mutatesSource}: {mutatesSource: boolean}) {
		this.mutatesSource = mutatesSource;
	}
}

type AddRenderRequestDynamicFields =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			jpegQuality: number;
			frame: number;
			scale: number;
			logLevel: LogLevel;
			chromeMode: ChromeMode;
			licenseKey: string | null;
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
			licenseKey: string | null;
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

export type UndoRedoNavigation = {
	undoRoute: string;
	redoRoute: string;
};

type CompositionEditRequest = {
	symbolicatedStack: SymbolicatedStackFrame | null;
	undoRedoNavigation: UndoRedoNavigation | null;
};

export type AddCompositionRequest = CompositionEditRequest & {
	options: NewCompositionOptions;
};

export type DuplicateCompositionRequest = CompositionEditRequest & {
	idToDuplicate: string;
	newId: string;
	newHeight: number | null;
	newWidth: number | null;
	newFps: number | null;
	newDurationInFrames: number | null;
	tag: 'Still' | 'Composition';
};

export type RenameCompositionRequest = CompositionEditRequest & {
	idToRename: string;
	newId: string;
};

export type UpdateCompositionMetadataRequest = CompositionEditRequest & {
	idToUpdate: string;
	newDurationInFrames: number | null;
	newFps: number | null;
	newHeight: number | null;
	newWidth: number | null;
};

export type DeleteCompositionRequest = CompositionEditRequest & {
	idToDelete: string;
};

export type MoveCompositionRequest = CompositionEditRequest & {
	compositionId: string;
	destination: CompositionDestination;
};

export type AddFolderRequest = CompositionEditRequest & {
	folderName: string;
	parentName: string | null;
};

export type RenameFolderRequest = CompositionEditRequest & {
	folderName: string;
	parentName: string | null;
	newName: string;
};

export type UnwrapFolderRequest = CompositionEditRequest & {
	folderName: string;
	parentName: string | null;
};

export type MoveFolderRequest = CompositionEditRequest & {
	folderName: string;
	parentName: string | null;
	destination: CompositionDestination;
};

export type CompositionEditResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation | null;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
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

export type CopyRenderOutputToAssetRequest = {
	outputPath: string;
	assetPath: string;
};

export type CopyRenderOutputToAssetResponse = {
	created: boolean;
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
	assetKeys: string[];
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

export type SubscribeToSequencePropsBatchRequest = {
	requests: SubscribeToSequencePropsRequest[];
};

export type SubscribeToSequencePropsBatchResponse = {
	results: SubscribeToSequencePropsResponse[];
};

export type UnsubscribeFromSequencePropsRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	clientId: string;
	sequenceKeys: string[];
	assetKeys: string[];
	effectKeys: string[][];
};

export type GoogleFontSourceEdit = {
	fontFamily: string;
	importName: string;
	style: string;
	weights: string[];
	subsets: string[];
};

export type SaveSequencePropSourceEdit =
	| {type: 'playback-rate'}
	| {
			type: 'google-font';
			font: GoogleFontSourceEdit;
	  }
	| {
			type: 'clipboard-param';
			param: EffectClipboardParam;
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

export type CaptionPatch = {
	index: number;
	before: {
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter: boolean | null;
	};
	insertAfter: {
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter: boolean | null;
	} | null;
	changes: Partial<{
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter: boolean;
	}>;
};

export type SaveInlineCaptionPatchesRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	schema: InteractivitySchema;
	patches: CaptionPatch[];
};

export type SaveSequencePropsRequest = {
	edits: SaveSequencePropEdit[];
	captionPatches?: SaveInlineCaptionPatchesRequest[];
	addedKeyframes: AddSequenceKeyframe[] | null;
	movedKeyframes: {
		sequenceKeyframes: MoveSequenceKeyframe[];
		effectKeyframes: MoveEffectKeyframe[];
	} | null;
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

export type SaveSequencePropsResult = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	props: Record<string, CanUpdateSequencePropSource>;
};

export type SaveSequencePropsResponse =
	| {
			canUpdate: true;
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

type WithoutClientId<T> = T extends unknown ? Omit<T, 'clientId'> : never;

export type SaveMultipleEffectPropsEdit =
	WithoutClientId<SaveEffectPropsRequest>;

export type SaveMultipleEffectPropsRequest = {
	edits: SaveMultipleEffectPropsEdit[];
	clientId: string;
	undoLabel: string;
	redoLabel: string;
};

export type SaveMultipleEffectPropsResult = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	status: CanUpdateEffectPropsResponse;
};

export type SaveMultipleEffectPropsResponse = {
	results: SaveMultipleEffectPropsResult[];
};

export type AddEffectRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectName: string;
	effectImportPath: string;
	effectConfig: EffectConfig;
	clientId: string;
};

export type AddEffectResponse =
	| {
			success: true;
			insertedEffect: {
				effectIndex: number;
				nodePath: SequencePropsSubscriptionKey['nodePath'];
			};
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
	sourceNodePaths: SequencePropsSubscriptionKey[];
	targetNodePath: SequencePropsSubscriptionKey;
	position: ReorderSequencePosition;
	clientId: string;
};

export type ReorderSequenceResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
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
	valueWhenLastKeyframeDeleted?: unknown;
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
	valueWhenLastKeyframeDeleted?: unknown;
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
	nodePathMutation: SequenceNodePathMutation | null;
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
			output: InterpolateOutputOption | undefined;
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

export type BatchUpdateSequenceKeyframeSettings = Omit<
	UpdateSequenceKeyframeSettingsRequest,
	'clientId'
>;

export type BatchUpdateEffectKeyframeSettings = Omit<
	UpdateEffectKeyframeSettingsRequest,
	'clientId'
>;

export type BatchUpdateKeyframeSettingsRequest = {
	sequenceKeyframes: BatchUpdateSequenceKeyframeSettings[];
	effectKeyframes: BatchUpdateEffectKeyframeSettings[];
	clientId: string;
};

export type BatchUpdateKeyframeSettingsResponse = {
	success: true;
};

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
	insertAtIndices: number[] | null;
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

export type DeleteNodesRequestItem = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type DeleteNodesRequest = {
	nodes: DeleteNodesRequestItem[];
};

export type DeleteNodesResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type DuplicateNodesRequestItem = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type DuplicateNodesRequest = {
	nodes: DuplicateNodesRequestItem[];
};

export type DuplicateNodesResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type NodeWrapper =
	| 'AbsoluteFill'
	| 'Sequence'
	| 'HtmlInCanvas'
	| 'HtmlInCanvasMotionBlur';

export type WrapNodeRequest = {
	fileName: string;
	compositionId: string;
	nodePath: SequenceNodePath;
	wrapper: NodeWrapper | null;
	width: number | null;
	height: number | null;
	timing: {
		from: number;
		durationInFrames: number;
		trimBefore: number;
	} | null;
};

export type WrapNodeResponse =
	| {
			success: true;
			canWrap: boolean;
			canWrapHtmlInCanvas: boolean;
			nodePathMutation: SequenceNodePathMutation | null;
	  }
	| {success: false; reason: string; stack: string};

export type PrecomposeJsxNodesRequestItem = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type PrecomposeJsxNodesRequest = {
	nodes: PrecomposeJsxNodesRequestItem[];
	compositionFile: string;
	compositionId: string;
	existingCompositionIds: string[];
	metadata: {
		width: number;
		height: number;
		fps: number;
		durationInFrames: number;
	};
	dryRun: boolean;
};

export type PrecomposeJsxNodesResponse =
	| {
			success: true;
			canPrecompose: boolean;
			reason: string | null;
			nodePathMutation: SequenceNodePathMutation | null;
			newCompositionId: string | null;
	  }
	| {success: false; reason: string; stack: string};

export type SplitSequencesRequestItem = {
	fileName: string;
	nodePath: SequenceNodePath;
	sequenceKeys: string[];
	splitFrame: number;
	videoConfigValues: VideoConfigValues | null;
};

export type SplitSequencesRequest = {
	sequences: SplitSequencesRequestItem[];
};

export type SplitSequencesResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type SplitVideoFromAudioRequest = {
	fileName: string;
	nodePath: SequenceNodePath;
};

export type SplitVideoFromAudioResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type InsertBasicCaptionsRequest = {
	fileName: string;
	nodePath: SequenceNodePath;
	durationInFrames: number | null;
	premountFor: number | null;
	captions: {
		text: string;
		startMs: number;
		endMs: number;
		timestampMs: number | null;
		confidence: number | null;
		pageBreakAfter?: boolean;
	}[];
};

export type InsertBasicCaptionsResponse =
	| {success: true; nodePathMutation: SequenceNodePathMutation}
	| {success: false; reason: string; stack: string};

export type ReplaceVideoSourceRequest = {
	fileName: string;
	nodePath: SequenceNodePath;
	src: string;
};

export type ReplaceVideoSourceResponse =
	| {success: true; nodePathMutation: SequenceNodePathMutation}
	| {success: false; reason: string; stack: string};

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
			durationInFrames: number | null;
			position: InsertableCompositionElementPosition | null;
	  }
	| {
			type: 'svg';
			markup: string;
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

export type InsertCompositionElementRequest = {
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
	from: number | null;
	premountFor: number | null;
};

export type InsertCompositionElementResponse =
	| {
			success: true;
			insertedNodePath: Pick<
				SequencePropsSubscriptionKey,
				'absolutePath' | 'nodePath'
			> | null;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type ConvertFigmaClipboardToSvgRequest = {
	html: string;
};

export type ConvertFigmaClipboardToSvgResponse =
	| {
			success: true;
			svg: string;
	  }
	| {
			success: false;
			reason: string;
	  };

export type ElementInstallExpectedFileState =
	| {
			exists: false;
	  }
	| {
			exists: true;
			sourceHash: string;
	  };

export type ElementInstallDestination =
	| {
			type: 'selected-media';
			compositionFile: string;
	  }
	| {
			type: 'current-composition';
			compositionFile: string;
			compositionId: string;
	  }
	| {
			type: 'new-composition';
			compositionFile: string | null;
	  };

export type PrepareElementInstallRequest = {
	installationName: string | null;
	destination: ElementInstallDestination;
	element: InstallableElement;
};

export type PrepareElementInstallResponse =
	| {
			success: true;
			plan: {
				compositionFile: string;
				filePath: string;
				expectedFileState: ElementInstallExpectedFileState;
			};
	  }
	| {
			success: false;
			reason: string;
			stack: string;
	  };

export type InsertElementRequest = {
	installationName: string | null;
	element: InstallableElement;
	expectedFileState: ElementInstallExpectedFileState | null;
	from: number | null;
	premountFor: number | null;
	position: InsertableCompositionElementPosition | null;
	overwriteExisting: boolean;
	undoRedoNavigation: UndoRedoNavigation | null;
} & (
	| {
			captionTarget: InsertBasicCaptionsRequest;
			compositionFile: null;
			compositionId: null;
			newComposition: null;
	  }
	| {
			captionTarget: null;
			compositionFile: string;
			compositionId: string;
			newComposition: {
				options: NewCompositionOptions;
				symbolicatedStack: SymbolicatedStackFrame | null;
			} | null;
	  }
);

export type InsertElementFileConflict = {
	filePath: string;
	existingSource: string;
	incomingSource: string;
};

export type InsertElementResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation;
	  }
	| {
			success: false;
			type: 'file-conflict';
			conflict: InsertElementFileConflict;
	  }
	| {
			success: false;
			type: 'error';
			reason: string;
			stack: string;
	  };

export type ElementInstallSource =
	| {
			type: 'studio-protocol';
			origin: string;
	  }
	| {
			type: 'browser-studio-link';
			origin: string | null;
	  }
	| {
			type: 'drag-and-drop';
	  };

export type ElementInstallRequest = {
	id: string;
	clientId: string;
	createdAt: number;
	compositionFile: string | null;
	compositionId: string | null;
	element: InstallableElement;
	from: number | null;
	position: InsertableCompositionElementPosition | null;
	source: ElementInstallSource;
};

export type UpdateElementInstallTargetRequest = {
	requestId: string | null;
	clientId: string;
	compositionFile: string | null;
	compositionId: string | null;
	lastFocusedAt: number | null;
	readOnly: boolean;
	studioUrl: string;
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
	skillsUpdateAvailable: boolean;
	skillsUpdateDetails: {
		outdatedSkills: {
			name: string;
			installedVersion: string | null;
			reason: 'older-version' | 'missing-version' | 'invalid-version';
		}[];
	} | null;
	timedOut: boolean;
	packageManager: PackageManager | 'unknown';
};

export type GetReleaseNotesRequest = {
	currentVersion: string;
	latestVersion: string;
};

export type GetReleaseNotesResponse = {
	hasMore: boolean;
	releases: {
		publishedAt: string | null;
		releaseNotesHtml: string | null;
		version: string;
	}[];
};

export type GetRemotionSkillsInfoRequest = {};
export type InstallRemotionSkillRequest = {
	skill: string;
};
export type RemoveRemotionSkillRequest = {
	skill: string;
};
export type UpgradeRemotionSkillRequest = {
	skill: string;
};
export type OpenRemotionSkillRequest = {
	skill: string;
	scope: 'project' | 'global';
};
export type GetRemotionSkillsInfoResponse = {
	studioServerStartedByAgent: boolean;
	studioRestartSkill: 'remotion-studio' | 'remotion-best-practices' | null;
	remotionUpgradeSkillAvailable: boolean;
	remotionInteractivitySkillAvailable: boolean;
	installations: {
		name: string;
		scope: 'project' | 'global';
		version: string | null;
		outdated: boolean;
	}[];
	skills: {
		name: string;
		installedInProject: boolean;
		installedGlobally: boolean;
	}[];
};

export type ProjectInfoRequest = {};
export type ProjectInfoResponse = {
	projectInfo: ProjectInfo;
};

export type ShutdownStudioResponse = {};

export type RestartStudioRequest = {};
export type RestartStudioResponse = {};

export type ConfigValue =
	| string
	| number
	| boolean
	| null
	| ConfigValue[]
	| {[key: string]: ConfigValue};

export type ConfigUpdate =
	| {
			setter: string;
			type: 'delete';
			value?: string;
	  }
	| {
			setter: string;
			type: 'set';
			value: ConfigValue;
	  };

export type UpdateConfigRequest = {
	clientId: string;
	updates: ConfigUpdate[];
};
export type UpdateConfigResponse =
	| {success: true}
	| {success: false; reason: string};

export type GetDefaultEditorInfoRequest = {
	recentlyUsedIds: readonly EditorPickerId[];
};
export type EditorPickerId = BuiltInEditor | 'custom';
export type GetDefaultEditorInfoResponse = {
	defaultEditor: EditorPickerId | null;
	runningEditors: readonly EditorPickerId[] | null;
	installedEditors: {
		id: EditorPickerId;
		name: string;
		nameWithType: string;
	}[];
};

export type GetDefaultCodingAgentInfoRequest = {
	recentlyUsedIds: readonly DefaultCodingAgent[];
};
export type GetDefaultCodingAgentInfoResponse = {
	defaultCodingAgent: DefaultCodingAgent | null;
	runningCodingAgents: readonly DefaultCodingAgent[] | null;
	installedCodingAgents: {
		id: DefaultCodingAgent;
		name: string;
		nameWithType: string;
	}[];
	installedTerminals: {
		id: TerminalId;
		name: string;
	}[];
	installedGitClients: {
		id: GitClientId;
		name: string;
	}[];
};

export type GetAppInfoRequest = {
	editor: GetDefaultEditorInfoRequest;
	codingAgent: GetDefaultCodingAgentInfoRequest;
};
export type GetAppInfoResponse = {
	editorInfo: GetDefaultEditorInfoResponse;
	codingAgentInfo: GetDefaultCodingAgentInfoResponse;
};

export type PackageInstallSpec = {
	readonly name: string;
	readonly version: string | null;
};

export type InstallPackageRequest = {
	dependencies: PackageInstallSpec[];
};
export type InstallPackageResponse = {};

export type UndoRequest = {};
export type UndoResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation | null;
			route: string | null;
	  }
	| {
			success: false;
			reason: string;
	  };

export type RedoRequest = {};
export type RedoResponse =
	| {
			success: true;
			nodePathMutation: SequenceNodePathMutation | null;
			route: string | null;
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

// When adding a route, also update the Browser Studio parity checklist:
// https://github.com/remotion-dev/remotion/issues/9807
export const studioOperations = {
	'/api/shared-memory-capture-support': new StudioOperation<
		{
			browserExecutable: string | null;
			chromeMode: ChromeMode;
			chromiumOptions: RequiredChromiumOptions;
		},
		{supported: boolean}
	>({mutatesSource: false}),
	'/api/invalidate-bundle': new StudioOperation<
		Record<string, never>,
		{didInvalidate: boolean}
	>({mutatesSource: true}),
	'/api/composition-component-info': new StudioOperation<
		CompositionComponentInfoRequest,
		CompositionComponentInfoResponse
	>({mutatesSource: false}),
	'/api/cancel': new StudioOperation<CancelRenderRequest, CancelRenderResponse>(
		{mutatesSource: false},
	),
	'/api/render': new StudioOperation<AddRenderRequest, undefined>({
		mutatesSource: false,
	}),
	'/api/unsubscribe-from-file-existence': new StudioOperation<
		UnsubscribeFromFileExistenceRequest,
		undefined
	>({mutatesSource: false}),
	'/api/subscribe-to-file-existence': new StudioOperation<
		SubscribeToFileExistenceRequest,
		SubscribeToFileExistenceResponse
	>({mutatesSource: false}),
	'/api/remove-render': new StudioOperation<RemoveRenderRequest, undefined>({
		mutatesSource: false,
	}),
	'/api/open-in-editor': new StudioOperation<
		OpenInEditorRequest,
		OpenInEditorResponse
	>({mutatesSource: false}),
	'/api/open-in-coding-agent': new StudioOperation<
		OpenInCodingAgentRequest,
		OpenInCodingAgentResponse
	>({mutatesSource: false}),
	'/api/app-info': new StudioOperation<GetAppInfoRequest, GetAppInfoResponse>({
		mutatesSource: false,
	}),
	'/api/find-in-file': new StudioOperation<
		FindInFileRequest,
		FindInFileResponse
	>({mutatesSource: false}),
	'/api/open-in-file-explorer': new StudioOperation<
		OpenInFileExplorerRequest,
		void
	>({mutatesSource: false}),
	'/api/open-in-terminal': new StudioOperation<
		OpenInTerminalRequest,
		OpenInTerminalResponse
	>({mutatesSource: false}),
	'/api/open-in-git-client': new StudioOperation<
		OpenInGitClientRequest,
		OpenInGitClientResponse
	>({mutatesSource: false}),
	'/api/register-client-render': new StudioOperation<
		CompletedClientRender,
		void
	>({mutatesSource: false}),
	'/api/unregister-client-render': new StudioOperation<{id: string}, void>({
		mutatesSource: false,
	}),
	'/api/update-default-props': new StudioOperation<
		UpdateDefaultPropsRequest,
		UpdateDefaultPropsResponse
	>({mutatesSource: true}),
	'/api/apply-visual-control-change': new StudioOperation<
		ApplyVisualControlRequest,
		ApplyVisualControlResponse
	>({mutatesSource: true}),
	'/api/subscribe-to-default-props': new StudioOperation<
		SubscribeToDefaultPropsRequest,
		SubscribeToDefaultPropsResponse
	>({mutatesSource: false}),
	'/api/unsubscribe-from-default-props': new StudioOperation<
		UnsubscribeFromDefaultPropsRequest,
		undefined
	>({mutatesSource: false}),
	'/api/subscribe-to-sequence-props': new StudioOperation<
		SubscribeToSequencePropsBatchRequest,
		SubscribeToSequencePropsBatchResponse
	>({mutatesSource: false}),
	'/api/unsubscribe-from-sequence-props': new StudioOperation<
		UnsubscribeFromSequencePropsRequest,
		undefined
	>({mutatesSource: false}),
	'/api/save-sequence-props': new StudioOperation<
		SaveSequencePropsRequest,
		SaveSequencePropsResponse
	>({mutatesSource: true}),
	'/api/save-effect-props': new StudioOperation<
		SaveEffectPropsRequest,
		SaveEffectPropsResponse
	>({mutatesSource: true}),
	'/api/save-multiple-effect-props': new StudioOperation<
		SaveMultipleEffectPropsRequest,
		SaveMultipleEffectPropsResponse
	>({mutatesSource: true}),
	'/api/add-effect': new StudioOperation<AddEffectRequest, AddEffectResponse>({
		mutatesSource: true,
	}),
	'/api/reorder-effect': new StudioOperation<
		ReorderEffectRequest,
		ReorderEffectResponse
	>({mutatesSource: true}),
	'/api/duplicate-effect': new StudioOperation<
		DuplicateEffectRequest,
		DuplicateEffectResponse
	>({mutatesSource: true}),
	'/api/reorder-sequence': new StudioOperation<
		ReorderSequenceRequest,
		ReorderSequenceResponse
	>({mutatesSource: true}),
	'/api/delete-keyframes': new StudioOperation<
		DeleteKeyframesRequest,
		DeleteKeyframesResponse
	>({mutatesSource: true}),
	'/api/move-keyframes': new StudioOperation<
		MoveKeyframesRequest,
		MoveKeyframesResponse
	>({mutatesSource: true}),
	'/api/add-sequence-keyframe': new StudioOperation<
		AddSequenceKeyframeRequest,
		AddSequenceKeyframeResponse
	>({mutatesSource: true}),
	'/api/add-effect-keyframe': new StudioOperation<
		AddEffectKeyframeRequest,
		AddEffectKeyframeResponse
	>({mutatesSource: true}),
	'/api/add-keyframes': new StudioOperation<
		AddKeyframesRequest,
		AddKeyframesResponse
	>({mutatesSource: true}),
	'/api/update-sequence-keyframe-settings': new StudioOperation<
		UpdateSequenceKeyframeSettingsRequest,
		UpdateSequenceKeyframeSettingsResponse
	>({mutatesSource: true}),
	'/api/update-effect-keyframe-settings': new StudioOperation<
		UpdateEffectKeyframeSettingsRequest,
		UpdateEffectKeyframeSettingsResponse
	>({mutatesSource: true}),
	'/api/batch-update-keyframe-settings': new StudioOperation<
		BatchUpdateKeyframeSettingsRequest,
		BatchUpdateKeyframeSettingsResponse
	>({mutatesSource: true}),
	'/api/delete-effect': new StudioOperation<
		DeleteEffectRequest,
		DeleteEffectResponse
	>({mutatesSource: true}),
	'/api/paste-effects': new StudioOperation<
		PasteEffectsRequest,
		PasteEffectsResponse
	>({mutatesSource: true}),
	'/api/delete-nodes': new StudioOperation<
		DeleteNodesRequest,
		DeleteNodesResponse
	>({mutatesSource: true}),
	'/api/duplicate-nodes': new StudioOperation<
		DuplicateNodesRequest,
		DuplicateNodesResponse
	>({mutatesSource: true}),
	'/api/precompose-jsx-nodes': new StudioOperation<
		PrecomposeJsxNodesRequest,
		PrecomposeJsxNodesResponse
	>({mutatesSource: true}),
	'/api/wrap-node': new StudioOperation<WrapNodeRequest, WrapNodeResponse>({
		mutatesSource: true,
	}),
	'/api/split-sequences': new StudioOperation<
		SplitSequencesRequest,
		SplitSequencesResponse
	>({mutatesSource: true}),
	'/api/split-video-from-audio': new StudioOperation<
		SplitVideoFromAudioRequest,
		SplitVideoFromAudioResponse
	>({mutatesSource: true}),
	'/api/insert-basic-captions': new StudioOperation<
		InsertBasicCaptionsRequest,
		InsertBasicCaptionsResponse
	>({mutatesSource: true}),
	'/api/replace-video-source': new StudioOperation<
		ReplaceVideoSourceRequest,
		ReplaceVideoSourceResponse
	>({mutatesSource: true}),
	'/api/insert-composition-element': new StudioOperation<
		InsertCompositionElementRequest,
		InsertCompositionElementResponse
	>({mutatesSource: true}),
	'/api/convert-figma-clipboard-to-svg': new StudioOperation<
		ConvertFigmaClipboardToSvgRequest,
		ConvertFigmaClipboardToSvgResponse
	>({mutatesSource: false}),
	'/api/insert-element': new StudioOperation<
		InsertElementRequest,
		InsertElementResponse
	>({mutatesSource: true}),
	'/api/prepare-element-install': new StudioOperation<
		PrepareElementInstallRequest,
		PrepareElementInstallResponse
	>({mutatesSource: true}),
	'/api/update-element-install-target': new StudioOperation<
		UpdateElementInstallTargetRequest,
		UpdateElementInstallTargetResponse
	>({mutatesSource: false}),
	'/api/download-remote-asset': new StudioOperation<
		DownloadRemoteAssetRequest,
		DownloadRemoteAssetResponse
	>({mutatesSource: false}),
	'/api/update-available': new StudioOperation<
		UpdateAvailableRequest,
		UpdateAvailableResponse
	>({mutatesSource: false}),
	'/api/release-notes': new StudioOperation<
		GetReleaseNotesRequest,
		GetReleaseNotesResponse
	>({mutatesSource: false}),
	'/api/remotion-skills-info': new StudioOperation<
		GetRemotionSkillsInfoRequest,
		GetRemotionSkillsInfoResponse
	>({mutatesSource: false}),
	'/api/install-remotion-skill': new StudioOperation<
		InstallRemotionSkillRequest,
		GetRemotionSkillsInfoResponse
	>({mutatesSource: false}),
	'/api/remove-remotion-skill': new StudioOperation<
		RemoveRemotionSkillRequest,
		GetRemotionSkillsInfoResponse
	>({mutatesSource: false}),
	'/api/upgrade-remotion-skill': new StudioOperation<
		UpgradeRemotionSkillRequest,
		GetRemotionSkillsInfoResponse
	>({mutatesSource: false}),
	'/api/open-remotion-skill': new StudioOperation<
		OpenRemotionSkillRequest,
		void
	>({mutatesSource: false}),
	'/api/add-composition': new StudioOperation<
		AddCompositionRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/duplicate-composition': new StudioOperation<
		DuplicateCompositionRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/rename-composition': new StudioOperation<
		RenameCompositionRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/update-composition-metadata': new StudioOperation<
		UpdateCompositionMetadataRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/delete-composition': new StudioOperation<
		DeleteCompositionRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/move-composition': new StudioOperation<
		MoveCompositionRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/add-folder': new StudioOperation<
		AddFolderRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/rename-folder': new StudioOperation<
		RenameFolderRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/unwrap-folder': new StudioOperation<
		UnwrapFolderRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/move-folder': new StudioOperation<
		MoveFolderRequest,
		CompositionEditResponse
	>({mutatesSource: true}),
	'/api/project-info': new StudioOperation<
		ProjectInfoRequest,
		ProjectInfoResponse
	>({mutatesSource: false}),
	'/api/delete-static-file': new StudioOperation<
		DeleteStaticFileRequest,
		DeleteStaticFileResponse
	>({mutatesSource: false}),
	'/api/rename-static-file': new StudioOperation<
		RenameStaticFileRequest,
		RenameStaticFileResponse
	>({mutatesSource: false}),
	'/api/copy-render-output-to-asset': new StudioOperation<
		CopyRenderOutputToAssetRequest,
		CopyRenderOutputToAssetResponse
	>({mutatesSource: false}),
	'/api/upgrade-remotion': new StudioOperation<{version: string}, {}>({
		mutatesSource: false,
	}),
	'/api/shutdown-studio': new StudioOperation<{}, ShutdownStudioResponse>({
		mutatesSource: false,
	}),
	'/api/restart-studio': new StudioOperation<
		RestartStudioRequest,
		RestartStudioResponse
	>({mutatesSource: false}),
	'/api/update-config': new StudioOperation<
		UpdateConfigRequest,
		UpdateConfigResponse
	>({mutatesSource: false}),
	'/api/install-package': new StudioOperation<
		InstallPackageRequest,
		InstallPackageResponse
	>({mutatesSource: false}),
	'/api/undo': new StudioOperation<UndoRequest, UndoResponse>({
		mutatesSource: true,
	}),
	'/api/redo': new StudioOperation<RedoRequest, RedoResponse>({
		mutatesSource: true,
	}),
	'/api/log-studio-error': new StudioOperation<
		LogStudioErrorRequest,
		LogStudioErrorResponse
	>({mutatesSource: false}),
};

export type ApiRoutes = {
	[Endpoint in keyof typeof studioOperations]: Pick<
		(typeof studioOperations)[Endpoint],
		'Request' | 'Response'
	>;
};
