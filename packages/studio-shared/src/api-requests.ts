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
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	SequenceSchema,
} from 'remotion';
import type {RecastCodemod, VisualControlChange} from './codemods';
import type {PackageManager} from './package-manager';
import type {ProjectInfo} from './project-info';
import type {RequiredChromiumOptions} from './render-job';
import type {SymbolicatedStackFrame} from './stack-types';
import type {EnumPath} from './stringify-default-props';

export type OpenInFileExplorerRequest = {
	directory: string;
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

export type SaveSequencePropsRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	value: string;
	defaultValue: string | null;
	schema: SequenceSchema;
	clientId: string;
};

export type SaveSequencePropsResponse =
	| {
			canUpdate: true;
			props: Record<string, CanUpdateSequencePropStatus>;
	  }
	| {
			canUpdate: false;
			reason: CannotUpdateSequenceReason;
	  };

export type SaveEffectPropsRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	value: string;
	defaultValue: string | null;
	schema: SequenceSchema;
	clientId: string;
};

export type SaveEffectPropsResponse = CanUpdateEffectPropsResponse;

export type DeleteSequenceKeyframeRequest = {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	key: string;
	frame: number;
	schema: SequenceSchema;
	clientId: string;
};

export type DeleteSequenceKeyframeResponse = SaveSequencePropsResponse;

export type DeleteEffectKeyframeRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
	key: string;
	frame: number;
	schema: SequenceSchema;
	clientId: string;
};

export type DeleteEffectKeyframeResponse = SaveEffectPropsResponse;

export type DeleteEffectRequest = {
	fileName: string;
	sequenceNodePath: SequencePropsSubscriptionKey;
	effectIndex: number;
};

export type DeleteEffectResponse =
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

export type ApiRoutes = {
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
	'/api/open-in-file-explorer': ReqAndRes<OpenInFileExplorerRequest, void>;
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
	'/api/delete-sequence-keyframe': ReqAndRes<
		DeleteSequenceKeyframeRequest,
		DeleteSequenceKeyframeResponse
	>;
	'/api/delete-effect-keyframe': ReqAndRes<
		DeleteEffectKeyframeRequest,
		DeleteEffectKeyframeResponse
	>;
	'/api/delete-effect': ReqAndRes<DeleteEffectRequest, DeleteEffectResponse>;
	'/api/delete-jsx-node': ReqAndRes<
		DeleteJsxNodeRequest,
		DeleteJsxNodeResponse
	>;
	'/api/duplicate-jsx-node': ReqAndRes<
		DuplicateJsxNodeRequest,
		DuplicateJsxNodeResponse
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
	'/api/restart-studio': ReqAndRes<RestartStudioRequest, RestartStudioResponse>;
	'/api/install-package': ReqAndRes<
		InstallPackageRequest,
		InstallPackageResponse
	>;
	'/api/undo': ReqAndRes<UndoRequest, UndoResponse>;
	'/api/redo': ReqAndRes<RedoRequest, RedoResponse>;
};
