import {CanvasInternals} from '@remotion/sdk';
import {isValidPackageName} from '@remotion/studio-shared';
import {
	useContext,
	useEffect,
	useMemo,
	useRef,
	type FC,
	type MutableRefObject,
} from 'react';
import {flushSync} from 'react-dom';
import {Internals, staticFile} from 'remotion';
import {installPackages} from '../api/install-package';
import {pause} from '../api/pause';
import {play} from '../api/play';
import {restartStudio} from '../api/restart-studio';
import {seek} from '../api/seek';
import {shutDownStudio} from '../api/shut-down-studio';
import {getCurrentError} from '../error-overlay/current-error';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {useTimelineCalculator} from '../helpers/calculate-timeline';
import {createFolderTree} from '../helpers/create-folder-tree';
import {
	formatContextForAgents,
	getRelativeFileLocation,
} from '../helpers/format-file-location';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {
	clampTimelineZoom,
	getTimelineMinZoom,
	getTimelineZoom,
	normalizedToTimelineZoom,
	timelineZoomToNormalized,
} from '../helpers/get-timeline-max-zoom';
import type {TimelineTrackData} from '../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {getRenderOutputPlaybackTarget} from '../helpers/render-output-playback';
import {
	EditorShowGuidesContext,
	persistGuidesList,
	type Guide,
} from '../state/editor-guides';
import {loadLoopOption, loopSetterRef, persistLoopOption} from '../state/loop';
import {persistMuteOption} from '../state/mute';
import {commonPlaybackRates, persistPlaybackRate} from '../state/playbackrate';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {useSelectComposition} from './InitialCompositionLoader';
import {useTrackForSelection} from './InspectorPanel/use-track-for-selection';
import {
	isOptionalPackageInstalled,
	markOptionalPackageInstalled,
} from './OptionalPackageModal';
import {
	getDefaultOutputBaseName,
	validatePublicOutputName,
} from './public-output-name';
import {
	isClientRenderJob,
	RenderQueueActionsContext,
	RenderQueueContext,
} from './RenderQueue/context';
import {useRenderJobRetry} from './RenderQueue/render-retry';
import {measureOutlineTargets} from './selected-outline-measurement';
import {getPendingTimelineTimingEdits} from './Timeline/commit-timeline-timing-edit';
import {
	deleteEffectsFromSource,
	getPendingEffectDeletions,
	isEffectDeletionPending,
} from './Timeline/delete-effects-from-source';
import {
	duplicateSequencesFromSource,
	getPendingSequenceDuplications,
	isSequenceDuplicationPending,
} from './Timeline/duplicate-selected-timeline-item';
import {
	getCurrentDuration,
	getCurrentFps,
	getCurrentFrame,
} from './Timeline/imperative-state';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {
	getPendingSequenceSplits,
	isSequenceSplitPending,
} from './Timeline/pending-sequence-splits';
import {shouldShowTrackInTimeline} from './Timeline/should-show-track-in-timeline';
import {scrollableRef} from './Timeline/timeline-refs';
import {
	getTimelineSelectionFromNodePathInfo,
	useCurrentTimelineSelectionStateAsRef,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {useCompactSeries} from './Timeline/use-compact-series';
import {useResolveStackAndReactToChange} from './Timeline/use-resolved-stack-react-to-change';
import {
	getDefaultCaptionOutputName,
	validateCaptionOutputName,
} from './Transcription/caption-output-name';
import {WHISPER_WEBGPU_PACKAGE} from './Transcription/whisper-webgpu-capability';
import {useStaticFiles} from './use-static-files';
import {VIDEO_MATTING_PACKAGE} from './VideoMatting/video-matting-capability';

type WebMcpTool = {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly inputSchema: Record<string, unknown>;
	readonly annotations: {readonly readOnlyHint: boolean};
	readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type WebMcpModelContext = {
	registerTool: (
		tool: WebMcpTool,
		options: {readonly signal: AbortSignal},
	) => Promise<void>;
};

type WebMcpCompositionTreeItem =
	| {
			readonly type: 'composition';
			readonly compositionName: string;
	  }
	| {
			readonly type: 'folder';
			readonly folderName: string;
			readonly children: WebMcpCompositionTreeItem[];
	  };

type WebMcpSequence = {
	readonly sequenceId: string;
	readonly name: string | null;
	readonly type: TimelineTrackData['sequence']['type'];
	readonly parentSequenceId: string | null;
	readonly depth: number;
	readonly startFrame: number;
	readonly endFrame: number;
	readonly durationInFrames: number;
	readonly stack: string | null;
	readonly selectable: boolean;
};

const serializeSequence = (track: TimelineTrackData): WebMcpSequence => {
	return {
		sequenceId: track.sequence.id,
		name:
			track.sequence.displayName ||
			track.sequence.controls?.componentName ||
			null,
		type: track.sequence.type,
		parentSequenceId: track.sequence.parent,
		depth: track.depth,
		startFrame: track.sequence.from,
		endFrame: track.sequence.from + track.sequence.duration - 1,
		durationInFrames: track.sequence.duration,
		stack: track.sequence.getStack(),
		selectable: track.nodePathInfo !== null,
	};
};

const serializeCompositionTree = (
	items: ReturnType<typeof createFolderTree>,
): WebMcpCompositionTreeItem[] => {
	return items.map((item): WebMcpCompositionTreeItem => {
		if (item.type === 'composition') {
			return {
				type: 'composition',
				compositionName: item.composition.id,
			};
		}

		return {
			type: 'folder',
			folderName: item.folderName,
			children: serializeCompositionTree(item.items),
		};
	});
};

const getNoStack = () => null;
const MAX_CANVAS_HTML_LENGTH = 100_000;

const missingOptionalPackageResult = (packageName: string) => ({
	error: `This requires ${packageName}. Call install_package with packageName set to ${packageName}, then retry.`,
	installPackage: {
		packageName,
		tool: 'install_package',
	},
	success: false,
});

const resolveAssetPath = ({
	assetPath,
	currentContent,
	staticFiles,
}: {
	readonly assetPath: unknown;
	readonly currentContent: {
		readonly asset?: string;
		readonly type: string;
	} | null;
	readonly staticFiles: readonly {readonly name: string}[];
}) => {
	const resolvedAssetPath =
		assetPath === undefined
			? currentContent?.type === 'asset'
				? (currentContent.asset ?? null)
				: null
			: assetPath;
	if (typeof resolvedAssetPath !== 'string' || resolvedAssetPath.length === 0) {
		throw new Error(
			'assetPath must be a non-empty public-folder path, or an asset must be selected in Studio.',
		);
	}

	if (!staticFiles.some((file) => file.name === resolvedAssetPath)) {
		throw new Error(`Asset ${resolvedAssetPath} was not found in public/.`);
	}

	return resolvedAssetPath;
};

const WebMcpSelectionSync: FC<{
	readonly currentSelectionRef: MutableRefObject<string | null>;
	readonly selectedSequenceRef: MutableRefObject<WebMcpSequence | null>;
}> = ({currentSelectionRef, selectedSequenceRef}) => {
	const {selectedItems} = useTimelineSelection();
	const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;
	const track = useTrackForSelection(selectedItem);
	const {resolvedLocation, stack} = useResolveStackAndReactToChange(
		track?.sequence.getStack ?? getNoStack,
		track?.sequence.controls?.overrideId ??
			track?.sequence.id ??
			'no-selection',
	);
	const currentStack = track?.sequence.getStack() ?? null;
	const currentResolvedLocation =
		stack === currentStack ? resolvedLocation : null;
	const currentSelection = useMemo(() => {
		if (
			selectedItems.length !== 1 ||
			selectedItem === null ||
			selectedItem.type === 'guide' ||
			track === null
		) {
			return null;
		}

		let name: string | null;
		if (selectedItem.type === 'sequence') {
			name =
				track.sequence.displayName ||
				track.sequence.controls?.componentName ||
				null;
		} else if (selectedItem.type === 'sequence-prop') {
			name = `Property "${selectedItem.key}"`;
		} else if (selectedItem.type === 'sequence-all-effects') {
			name = 'Effects';
		} else if (selectedItem.type === 'sequence-effect') {
			const {effects} = track.sequence;
			const effect = effects[selectedItem.i];
			name = effect ? `Effect "${effect.label}"` : null;
		} else if (selectedItem.type === 'sequence-effect-prop') {
			name = `Effect property "${selectedItem.key}"`;
		} else {
			const field = parseKeyframeFieldFromNodePath(
				selectedItem.nodePathInfo.auxiliaryKeys,
			);
			name =
				field?.type === 'sequence'
					? `Property "${field.fieldKey}"`
					: field?.type === 'effect'
						? `Effect property "${field.fieldKey}"`
						: null;
		}

		return formatContextForAgents({
			location: currentResolvedLocation,
			name,
			root: window.remotion_cwd,
		});
	}, [currentResolvedLocation, selectedItem, selectedItems.length, track]);
	currentSelectionRef.current = currentSelection;
	selectedSequenceRef.current =
		track === null ? null : serializeSequence(track);

	return null;
};

export const WebMcp: FC = () => {
	const calculateTimeline = useTimelineCalculator();
	const compactSeries = useCompactSeries();
	const compactSeriesRef = useRef(compactSeries);
	compactSeriesRef.current = compactSeries;
	const {addCaptionJob, addVideoMattingJob} = useContext(RenderQueueContext);
	const renderQueueActions = useContext(RenderQueueActionsContext);
	const renderJobRetry = useRenderJobRetry();
	const staticFiles = useStaticFiles();
	const timelineSelectionRef = useCurrentTimelineSelectionStateAsRef();
	const currentSelectionRef = useRef<string | null>(null);
	const selectedSequenceRef = useRef<WebMcpSequence | null>(null);
	const {canvasContent, compositions, currentCompositionMetadata, folders} =
		useContext(Internals.CompositionManager);
	const compositionManagerRef = useContext(
		Internals.CompositionManagerRefContext,
	);
	const {playbackRate: currentPlaybackRate, setPlaybackRate} =
		Internals.usePlaybackRate();
	const {isPlaying} = Internals.Timeline.useTimelineContext();
	const {mediaVolume, playerMuted} = useContext(Internals.MediaVolumeContext);
	const {setPlayerMuted, setMediaVolume} = useContext(
		Internals.SetMediaVolumeContext,
	);
	const {setZoom: setTimelineZoom, zoom: timelineZoomMap} =
		useContext(TimelineZoomCtx);
	const selectComposition = useSelectComposition();
	const {editorShowGuides, guidesList, setEditorShowGuides, setGuidesList} =
		useContext(EditorShowGuidesContext);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const currentCompositionDefinition = useMemo(() => {
		if (canvasContent?.type !== 'composition') {
			return null;
		}

		return (
			compositions.find(
				(composition) => composition.id === canvasContent.compositionId,
			) ?? null
		);
	}, [canvasContent, compositions]);
	const currentContent = useMemo(() => {
		if (canvasContent?.type === 'output-blob') {
			return {
				type: canvasContent.type,
				displayName: canvasContent.displayName,
				width: canvasContent.width,
				height: canvasContent.height,
				sizeInBytes: canvasContent.sizeInBytes,
			};
		}

		return canvasContent;
	}, [canvasContent]);
	const currentContentRef = useRef(currentContent);
	currentContentRef.current = currentContent;
	const staticFilesRef = useRef(staticFiles);
	staticFilesRef.current = staticFiles;
	const currentComposition = currentCompositionDefinition?.id ?? null;
	const currentCompositionRef = useRef(currentComposition);
	currentCompositionRef.current = currentComposition;
	const currentCompositionDefinitionRef = useRef(currentCompositionDefinition);
	currentCompositionDefinitionRef.current = currentCompositionDefinition;
	const compositionsRef = useRef(compositions);
	compositionsRef.current = compositions;
	const overrideIdToNodePathMappingsRef = useRef(overrideIdToNodePathMappings);
	overrideIdToNodePathMappingsRef.current = overrideIdToNodePathMappings;
	const foldersRef = useRef(folders);
	foldersRef.current = folders;
	const currentCompositionMetadataRef = useRef(currentCompositionMetadata);
	currentCompositionMetadataRef.current = currentCompositionMetadata;
	const guidesListRef = useRef(guidesList);
	guidesListRef.current = guidesList;
	const editorShowGuidesRef = useRef(editorShowGuides);
	editorShowGuidesRef.current = editorShowGuides;
	const mediaVolumeRef = useRef(mediaVolume);
	mediaVolumeRef.current = mediaVolume;
	const playbackRateRef = useRef(currentPlaybackRate);
	playbackRateRef.current = currentPlaybackRate;
	const playerMutedRef = useRef(playerMuted);
	playerMutedRef.current = playerMuted;
	const timelineZoomRef = useRef(timelineZoomMap);
	timelineZoomRef.current = timelineZoomMap;

	useEffect(() => {
		const {modelContext} = document as Document & {
			readonly modelContext?: WebMcpModelContext;
		};
		if (typeof modelContext?.registerTool !== 'function') {
			return;
		}

		const controller = new AbortController();
		const getCurrentPlaybackTarget = () => {
			const {canvasContent: content, currentAssetMetadata} =
				compositionManagerRef.current;
			if (content?.type === 'output' || content?.type === 'output-blob') {
				const output = getRenderOutputPlaybackTarget(content);
				if (output === null) return null;
				const {durationInFrames, fps} = output.getState();
				return {
					type: 'output' as const,
					id: output.id,
					durationInFrames,
					fps,
					output,
				};
			}

			const compositionId = currentCompositionRef.current;
			if (
				content?.type === 'composition' &&
				compositionId === content.compositionId
			) {
				return {
					type: 'timeline' as const,
					id: compositionId,
					durationInFrames: getCurrentDuration(),
					fps: getCurrentFps(),
				};
			}

			if (
				content?.type === 'asset' &&
				currentAssetMetadata?.asset === content.asset
			) {
				return {
					type: 'timeline' as const,
					id: `asset:${content.asset}`,
					durationInFrames: currentAssetMetadata.durationInFrames,
					fps: currentAssetMetadata.fps,
				};
			}

			return null;
		};

		const requireCurrentPlaybackTarget = () => {
			const target = getCurrentPlaybackTarget();
			if (target === null) {
				const content = compositionManagerRef.current.canvasContent;
				throw new Error(
					content?.type === 'output' || content?.type === 'output-blob'
						? 'The current render output does not have a ready audio or video preview.'
						: content?.type === 'asset'
							? 'The current asset does not have a ready audio or video preview.'
							: 'No composition or ready audio/video preview is currently selected.',
				);
			}

			return target;
		};

		const getCurrentTimeline = () => {
			const composition = currentCompositionDefinitionRef.current;
			if (composition === null) {
				return [];
			}

			const durationInFrames =
				currentCompositionMetadataRef.current?.durationInFrames ??
				composition.durationInFrames ??
				getCurrentDuration();

			return calculateTimeline({
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
				compositions: compositionsRef.current,
				showConnectedCompositionChildren: compactSeriesRef.current,
			}).tracks.filter((timelineTrack) =>
				shouldShowTrackInTimeline(timelineTrack, durationInFrames),
			);
		};

		Promise.all([
			modelContext.registerTool(
				{
					name: 'install_package',
					title: 'Install Studio package',
					description:
						'Install an npm package into the current Remotion project. Remotion packages are pinned to the current Remotion version, and known auxiliary packages are pinned to their recommended version.',
					inputSchema: {
						type: 'object',
						properties: {
							packageName: {
								type: 'string',
								description: 'The npm package name to install.',
							},
							version: {
								type: 'string',
								description:
									'An optional exact semantic version. Omit it to use the recommended version.',
							},
						},
						required: ['packageName'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async ({packageName, version}) => {
						if (
							typeof packageName !== 'string' ||
							!isValidPackageName(packageName)
						) {
							throw new Error('packageName must be a valid npm package name.');
						}

						if (
							version !== undefined &&
							(typeof version !== 'string' ||
								!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
									version,
								))
						) {
							throw new Error('version must be an exact semantic version.');
						}

						await installPackages([
							{
								name: packageName,
								version: typeof version === 'string' ? version : null,
							},
						]);
						markOptionalPackageInstalled(packageName);
						return {installed: true, packageName};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'transcribe_asset',
					title: 'Transcribe Studio asset',
					description:
						'Transcribe an audio or video asset from the public folder into Remotion Caption[] JSON and add the work to the Jobs queue. If assetPath is omitted, the asset currently open in Studio is used.',
					inputSchema: {
						type: 'object',
						properties: {
							assetPath: {
								type: 'string',
								description:
									'Optional path relative to public/. Defaults to the asset currently open in Studio.',
							},
							outputPath: {
								type: 'string',
								description:
									'Optional Caption[] JSON path relative to public/. Defaults to <asset>-captions.json.',
							},
							model: {
								type: 'string',
								default: 'small.en',
								description: 'Whisper model. Defaults to small.en.',
							},
							language: {
								type: 'string',
								default: 'en',
								description:
									'Spoken language code for multilingual models. Defaults to en.',
							},
							task: {
								type: 'string',
								enum: ['transcribe', 'translate'],
								default: 'transcribe',
							},
							chunkLengthInSeconds: {
								type: 'number',
								minimum: 1,
								maximum: 30,
								default: 30,
							},
							strideLengthInSeconds: {
								type: 'number',
								minimum: 0,
								default: 5,
							},
							forceFullSequences: {type: 'boolean', default: false},
							doSample: {type: 'boolean', default: false},
							temperature: {type: 'number', exclusiveMinimum: 0, default: 1},
							topK: {type: 'integer', minimum: 0, default: 50},
							repetitionPenalty: {
								type: 'number',
								exclusiveMinimum: 0,
								default: 1,
							},
							noRepeatNgramSize: {type: 'integer', minimum: 0, default: 0},
						},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async (input) => {
						if (!isOptionalPackageInstalled(WHISPER_WEBGPU_PACKAGE)) {
							return missingOptionalPackageResult(WHISPER_WEBGPU_PACKAGE);
						}

						const assetPath = resolveAssetPath({
							assetPath: input.assetPath,
							currentContent: currentContentRef.current,
							staticFiles: staticFilesRef.current,
						});
						const fileType = getPreviewFileType(assetPath);
						if (fileType !== 'audio' && fileType !== 'video') {
							throw new Error(
								'The transcription asset must be audio or video.',
							);
						}

						const whisper = await import('@remotion/whisper-webgpu');
						const modelName = input.model ?? 'small.en';
						if (typeof modelName !== 'string') {
							throw new Error('model must be a string.');
						}

						const model = whisper
							.getAvailableModels()
							.find((candidate) => candidate.name === modelName);
						if (!model) {
							throw new Error(`Unknown Whisper model: ${modelName}.`);
						}

						const task = input.task ?? 'transcribe';
						if (task !== 'transcribe' && task !== 'translate') {
							throw new Error('task must be transcribe or translate.');
						}

						if (task === 'translate' && !model.supportsTranslation) {
							throw new Error(`${model.name} does not support translation.`);
						}

						const language = input.language ?? 'en';
						if (typeof language !== 'string' || language.length === 0) {
							throw new Error('language must be a non-empty string.');
						}

						const chunkLengthInSeconds = input.chunkLengthInSeconds ?? 30;
						const strideLengthInSeconds = input.strideLengthInSeconds ?? 5;
						const temperature = input.temperature ?? 1;
						const topK = input.topK ?? 50;
						const repetitionPenalty = input.repetitionPenalty ?? 1;
						const noRepeatNgramSize = input.noRepeatNgramSize ?? 0;
						if (
							typeof chunkLengthInSeconds !== 'number' ||
							!Number.isFinite(chunkLengthInSeconds) ||
							chunkLengthInSeconds < 1 ||
							chunkLengthInSeconds > 30
						) {
							throw new Error('chunkLengthInSeconds must be between 1 and 30.');
						}

						if (
							typeof strideLengthInSeconds !== 'number' ||
							!Number.isFinite(strideLengthInSeconds) ||
							strideLengthInSeconds < 0 ||
							strideLengthInSeconds * 2 >= chunkLengthInSeconds
						) {
							throw new Error(
								'strideLengthInSeconds must be non-negative and less than half of chunkLengthInSeconds.',
							);
						}

						if (
							typeof temperature !== 'number' ||
							!Number.isFinite(temperature) ||
							temperature <= 0 ||
							typeof repetitionPenalty !== 'number' ||
							!Number.isFinite(repetitionPenalty) ||
							repetitionPenalty <= 0 ||
							typeof topK !== 'number' ||
							!Number.isInteger(topK) ||
							topK < 0 ||
							typeof noRepeatNgramSize !== 'number' ||
							!Number.isInteger(noRepeatNgramSize) ||
							noRepeatNgramSize < 0
						) {
							throw new Error('Invalid transcription decoding settings.');
						}

						const forceFullSequences = input.forceFullSequences ?? false;
						const doSample = input.doSample ?? false;
						if (
							typeof forceFullSequences !== 'boolean' ||
							typeof doSample !== 'boolean'
						) {
							throw new Error(
								'forceFullSequences and doSample must be booleans.',
							);
						}

						const src = staticFile(assetPath);
						const displayName = assetPath.split('/').at(-1) ?? assetPath;
						const outputPath =
							input.outputPath ?? getDefaultCaptionOutputName(src, displayName);
						if (typeof outputPath !== 'string') {
							throw new Error('outputPath must be a string.');
						}

						const outputError = validateCaptionOutputName(outputPath);
						if (outputError !== null) {
							throw new Error(outputError);
						}

						const jobId = addCaptionJob({
							captionStyle: null,
							audioStreamIndex: null,
							chunkLengthInSeconds,
							displayName,
							doSample,
							forceFullSequences,
							language: model.multilingual ? language : null,
							model: model.name,
							noRepeatNgramSize,
							outName: outputPath,
							target: null,
							repetitionPenalty,
							requestInit: null,
							src,
							strideLengthInSeconds,
							task,
							temperature,
							topK,
						});
						return {jobId, outputPath, success: true};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'remove_video_background',
					title: 'Remove video background',
					description:
						'Remove the background from a video asset in the public folder and add the work to the Jobs queue. If assetPath is omitted, the asset currently open in Studio is used.',
					inputSchema: {
						type: 'object',
						properties: {
							assetPath: {
								type: 'string',
								description:
									'Optional path relative to public/. Defaults to the asset currently open in Studio.',
							},
							outputPath: {
								type: 'string',
								description:
									'Optional transparent video output path relative to public/.',
							},
							model: {
								type: 'string',
								default: 'ben2-base',
							},
							audio: {
								type: 'string',
								enum: ['keep', 'none'],
								default: 'keep',
							},
							videoBitrate: {
								oneOf: [
									{
										type: 'string',
										enum: ['very-low', 'low', 'medium', 'high', 'very-high'],
									},
									{type: 'integer', minimum: 1},
								],
								default: 'very-high',
							},
						},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async (input) => {
						if (!isOptionalPackageInstalled(VIDEO_MATTING_PACKAGE)) {
							return missingOptionalPackageResult(VIDEO_MATTING_PACKAGE);
						}

						const assetPath = resolveAssetPath({
							assetPath: input.assetPath,
							currentContent: currentContentRef.current,
							staticFiles: staticFilesRef.current,
						});
						if (getPreviewFileType(assetPath) !== 'video') {
							throw new Error('The input asset must be a video.');
						}

						const videoMatting = await import('@remotion/video-matting');
						const modelName = input.model ?? 'ben2-base';
						if (typeof modelName !== 'string') {
							throw new Error('model must be a string.');
						}

						const model = videoMatting
							.getAvailableModels()
							.find((candidate) => candidate.name === modelName)?.name;
						if (!model) {
							throw new Error(`Unknown video matting model: ${modelName}.`);
						}

						const audio = input.audio ?? 'keep';
						if (audio !== 'keep' && audio !== 'none') {
							throw new Error('audio must be keep or none.');
						}

						const videoBitrate = input.videoBitrate ?? 'very-high';
						if (
							(typeof videoBitrate !== 'number' ||
								!Number.isInteger(videoBitrate) ||
								videoBitrate <= 0) &&
							videoBitrate !== 'very-low' &&
							videoBitrate !== 'low' &&
							videoBitrate !== 'medium' &&
							videoBitrate !== 'high' &&
							videoBitrate !== 'very-high'
						) {
							throw new Error('videoBitrate is invalid.');
						}

						const src = staticFile(assetPath);
						const displayName = assetPath.split('/').at(-1) ?? assetPath;
						const baseName = getDefaultOutputBaseName(
							src,
							displayName,
							'video',
						);
						const outputPath =
							input.outputPath ?? `${baseName}-no-background.webm`;
						if (typeof outputPath !== 'string') {
							throw new Error('Output path must be a string.');
						}

						const outputError = validatePublicOutputName({
							extension: '.webm',
							outName: outputPath,
						});
						if (outputError !== null) {
							throw new Error(outputError);
						}

						const jobId = addVideoMattingJob({
							audio,
							displayName,
							outName: outputPath,
							model,
							src,
							target: null,
							videoBitrate,
						});
						return {
							outputPath,
							jobId,
							success: true,
						};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'restart_studio',
					title: 'Restart Studio',
					description:
						'Restart the Studio server. The browser temporarily disconnects and reconnects when Studio is ready. Only available in a writable Studio with a server backend.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => restartStudio(),
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'shut_down_studio',
					title: 'Shut down Studio',
					description:
						'Gracefully shut down the Studio server. The browser disconnects. Start Studio again from the terminal to reconnect. Only available in a writable Studio with a server backend.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => shutDownStudio(),
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_render_jobs',
					title: 'Get Studio render jobs',
					description:
						'Read the server and browser render jobs currently shown in Studio, including progress, cancellation availability, pending cancellation, and whether the saved render settings can be reopened. Excludes transcription and background removal jobs. Reading jobs is available in all Studio modes.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						return Promise.resolve({
							jobs: renderQueueActions.getJobs().map((job) => {
								const retryState = renderJobRetry.getRetryState(job.id);
								return {
									id: job.id,
									type: job.type,
									compositionId: job.compositionId,
									outputName: job.outName,
									status: job.status,
									cancelling: renderQueueActions.isCancelling(job.id),
									canCancel: renderQueueActions.canCancelJob(job.id),
									canRetry: retryState.canRetry,
									retryUnavailableReason: retryState.reason,
									progress:
										job.status === 'done'
											? 1
											: job.status === 'idle'
												? 0
												: job.status === 'running'
													? isClientRenderJob(job)
														? job.progress.progress
														: job.progress.value
													: null,
									error: job.status === 'failed' ? job.error.message : null,
								};
							}),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'open_render_job_settings',
					title: 'Open Studio render job settings',
					description:
						'Open the same prefilled render dialog as Studio Retry for a completed, failed, or cancelled render job, without starting a render. Uses the job’s saved settings, or preserves unsaved edits if this job’s dialog is already open. The returned outputName identifies the saved job. Read canRetry and retryUnavailableReason from get_render_jobs first. Server settings require a connected interactive Studio; browser render settings can reopen locally in all modes when the original settings and composition are available.',
					inputSchema: {
						type: 'object',
						properties: {
							jobId: {
								type: 'string',
								minLength: 1,
								description: 'The render job id returned by get_render_jobs.',
							},
						},
						required: ['jobId'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({jobId}) => {
						if (typeof jobId !== 'string' || jobId.length === 0) {
							throw new Error('jobId must be a non-empty string.');
						}

						return Promise.resolve({
							jobId,
							...renderJobRetry.openRenderJobSettings(jobId),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'cancel_render_job',
					title: 'Cancel Studio render job',
					description:
						'Request cancellation of a render job using the same action as Studio. Get the jobId from get_render_jobs. Server jobs require a connected Studio server; queued or running browser render jobs can be cancelled locally in every Studio mode. A requested result acknowledges the cancellation request, not a terminal outcome; read get_render_jobs until the job finishes.',
					inputSchema: {
						type: 'object',
						properties: {
							jobId: {
								type: 'string',
								minLength: 1,
								description: 'The render job id returned by get_render_jobs.',
							},
						},
						required: ['jobId'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async ({jobId}) => {
						if (typeof jobId !== 'string' || jobId.length === 0) {
							throw new Error('jobId must be a non-empty string.');
						}

						const result = await renderQueueActions.cancelJob(jobId);
						return {jobId, ...result};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_current_error',
					title: 'Get current Studio error',
					description:
						'Read the error currently shown in the Remotion Studio error overlay. Returns null when the overlay is not visible and includes symbolicated stack frames when symbolication succeeds.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: async () => {
						const currentError = getCurrentError();
						if (currentError === null) {
							return null;
						}

						let symbolicatedStackFrames = null;
						try {
							const record = await currentError.symbolication;
							symbolicatedStackFrames = record?.stackFrames ?? null;
						} catch {
							// Fall back to the original stack if symbolication fails.
						}

						return {
							name: currentError.error.name,
							message: currentError.error.message,
							stack: currentError.error.stack ?? null,
							symbolicatedStackFrames,
						};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_compositions',
					title: 'Get Studio compositions',
					description:
						'Read the mounted Remotion Studio compositions as the nested folder tree shown in the sidebar.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const tree = createFolderTree(
							compositionsRef.current,
							foldersRef.current,
							{},
						);
						return Promise.resolve({
							compositions: serializeCompositionTree(tree),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'select_composition',
					title: 'Select Studio composition',
					description:
						'Open a registered composition in Remotion Studio by ID and acknowledge after the selection has committed. Preview metadata may still be loading.',
					inputSchema: {
						type: 'object',
						properties: {
							compositionName: {
								type: 'string',
								description: 'The ID of the composition to open.',
							},
						},
						required: ['compositionName'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({compositionName}) => {
						if (typeof compositionName !== 'string') {
							throw new Error('compositionName must be a string.');
						}

						const composition = compositionsRef.current.find(
							(candidate) => candidate.id === compositionName,
						);
						if (!composition) {
							throw new Error(`Composition ${compositionName} not found.`);
						}

						flushSync(() => selectComposition(composition, true));
						return Promise.resolve({
							currentContent: {
								type: 'composition',
								compositionId: composition.id,
							},
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_sequences',
					title: 'Get Studio sequences',
					description:
						'Read the mounted sequences in the current Remotion Studio timeline, including their IDs, hierarchy, timing, effects, source stack, selection availability, and pending timing edits, duplication, splitting, or effect deletion. Pending operations include source nodes that are temporarily unmounted during refresh.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						const pendingEffectDeletions = getPendingEffectDeletions();
						const pendingEffectsByNode = new Map(
							pendingEffectDeletions.map((entry) => [
								JSON.stringify([
									entry.nodePath.absolutePath,
									entry.nodePath.nodePath,
								]),
								entry,
							]),
						);
						const canDeleteEffects =
							timelineSelectionRef.current.canSelect &&
							canUseEffectOperations();
						return Promise.resolve({
							currentContent: currentContentRef.current,
							pendingTimingEdits: getPendingTimelineTimingEdits(),
							pendingDuplications: getPendingSequenceDuplications(),
							pendingSplits: getPendingSequenceSplits().map(
								({absolutePath, nodePath, splitFrame}) => ({
									absolutePath,
									nodePath,
									sourceFrame: splitFrame,
								}),
							),
							pendingEffectDeletions: pendingEffectDeletions.map(
								({nodePath, effectIndices}) => ({
									absolutePath: nodePath.absolutePath,
									nodePath: nodePath.nodePath,
									effectIndices,
								}),
							),
							sequences:
								compositionId === null
									? []
									: getCurrentTimeline().map((track) => {
											const nodePath =
												track.nodePathInfo?.sequenceSubscriptionKey ?? null;
											const pendingEffects = nodePath
												? pendingEffectsByNode.get(
														JSON.stringify([
															nodePath.absolutePath,
															nodePath.nodePath,
														]),
													)
												: undefined;
											return {
												...serializeSequence(track),
												splitting:
													track.nodePathInfo !== null &&
													isSequenceSplitPending(track.nodePathInfo),
												duplicating:
													track.nodePathInfo !== null &&
													isSequenceDuplicationPending(track.nodePathInfo),
												effects: track.sequence.effects.map(
													(effect, effectIndex) => {
														const status = nodePath
															? Internals.getEffectPropStatusesCtx({
																	propStatuses: propStatusesRef.current,
																	nodePath,
																	effectIndex,
																})
															: null;
														return {
															effectIndex,
															type: effect.type,
															label: effect.label,
															canDelete:
																canDeleteEffects &&
																pendingEffects === undefined &&
																status?.type === 'can-update-effect',
															deleting:
																pendingEffects !== undefined &&
																Internals.OptimisticEffectDeletion.matches(
																	pendingEffects,
																	track.sequence.effects,
																) &&
																pendingEffects.effectIndices.includes(
																	effectIndex,
																),
														};
													},
												),
											};
										}),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'delete_effect',
					title: 'Delete Studio effect',
					description:
						'Delete an effect from a sequence using the same action as the Studio interface. Read the current effectIndex from get_sequences before deleting. This edits the source and affects every runtime instance of that source node. Success means the deletion was saved; the preview may still be refreshing.',
					inputSchema: {
						type: 'object',
						properties: {
							sequenceId: {
								type: 'string',
								minLength: 1,
								description: 'The sequence ID returned by get_sequences.',
							},
							effectIndex: {
								type: 'integer',
								minimum: 0,
								description:
									'The current zero-based effect index returned by get_sequences.',
							},
						},
						required: ['sequenceId', 'effectIndex'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async ({sequenceId, effectIndex}) => {
						if (typeof sequenceId !== 'string' || sequenceId.length === 0) {
							throw new Error('sequenceId must be a non-empty string.');
						}

						if (
							typeof effectIndex !== 'number' ||
							!Number.isInteger(effectIndex) ||
							effectIndex < 0
						) {
							throw new Error('effectIndex must be a non-negative integer.');
						}

						if (currentCompositionRef.current === null) {
							throw new Error('No composition is currently selected.');
						}

						if (
							!timelineSelectionRef.current.canSelect ||
							!canUseEffectOperations()
						) {
							throw new Error('Studio effect editing is unavailable.');
						}

						const track = getCurrentTimeline().find(
							(candidate) => candidate.sequence.id === sequenceId,
						);
						if (!track) {
							throw new Error(
								`Sequence ${sequenceId} not found in the current composition.`,
							);
						}

						const nodePath =
							track.nodePathInfo?.sequenceSubscriptionKey ?? null;
						if (nodePath === null) {
							throw new Error(
								`The source for sequence ${sequenceId} is unavailable.`,
							);
						}

						if (!track.sequence.effects[effectIndex]) {
							throw new Error(
								`Effect ${effectIndex} not found on sequence ${sequenceId}.`,
							);
						}

						if (isEffectDeletionPending(nodePath)) {
							return {sequenceId, effectIndex, status: 'already-pending'};
						}

						const status = Internals.getEffectPropStatusesCtx({
							propStatuses: propStatusesRef.current,
							nodePath,
							effectIndex,
						});
						if (status.type !== 'can-update-effect') {
							throw new Error('The effect source is unavailable for deletion.');
						}

						const result = await deleteEffectsFromSource(
							[
								{
									nodePath,
									effectIndices: [effectIndex],
									effects: track.sequence.effects,
								},
							],
							timelineSelectionRef,
						);
						return {sequenceId, effectIndex, ...result};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'duplicate_sequence',
					title: 'Duplicate Studio sequence',
					description:
						'Duplicate the source JSX node for a mounted sequence using the same action as the Studio inspector. Requires source editing to be available. Success means the source copy was saved; new sequence IDs appear in get_sequences after the preview refreshes.',
					inputSchema: {
						type: 'object',
						properties: {
							sequenceId: {
								type: 'string',
								minLength: 1,
								description: 'The sequence ID returned by get_sequences.',
							},
							confirmProgrammaticDuplication: {
								type: 'boolean',
								description:
									'When one source node produces multiple runtime instances, copying that source node creates a copy for every instance. Set true to confirm this behavior; false cancels duplication of programmatically repeated nodes. Single-instance nodes do not require confirmation.',
							},
						},
						required: ['sequenceId', 'confirmProgrammaticDuplication'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async ({sequenceId, confirmProgrammaticDuplication}) => {
						if (typeof sequenceId !== 'string' || sequenceId.length === 0) {
							throw new Error('sequenceId must be a non-empty string.');
						}

						if (typeof confirmProgrammaticDuplication !== 'boolean') {
							throw new Error(
								'confirmProgrammaticDuplication must be a boolean.',
							);
						}

						if (currentCompositionRef.current === null) {
							throw new Error('No composition is currently selected.');
						}

						if (
							!timelineSelectionRef.current.canSelect ||
							!isStudioInteractivityEnabled()
						) {
							throw new Error('Studio source editing is unavailable.');
						}

						const track = getCurrentTimeline().find(
							(candidate) => candidate.sequence.id === sequenceId,
						);
						if (!track) {
							throw new Error(
								`Sequence ${sequenceId} not found in the current composition.`,
							);
						}

						if (track.sequence.timelineTrack?.role === 'transition') {
							throw new Error('Transitions cannot be duplicated.');
						}

						if (track.nodePathInfo === null) {
							throw new Error(
								`The source for sequence ${sequenceId} is unavailable.`,
							);
						}

						const result = await duplicateSequencesFromSource(
							[track.nodePathInfo],
							() => Promise.resolve(confirmProgrammaticDuplication),
						);
						return {sequenceId, ...result};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'select_sequence',
					title: 'Select Studio sequence',
					description:
						'Select and reveal a sequence in the current Remotion Studio timeline by the sequence ID returned by get_sequences.',
					inputSchema: {
						type: 'object',
						properties: {
							sequenceId: {
								type: 'string',
								minLength: 1,
								description: 'The sequence ID returned by get_sequences.',
							},
						},
						required: ['sequenceId'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({sequenceId}) => {
						if (typeof sequenceId !== 'string' || sequenceId.length === 0) {
							throw new Error('sequenceId must be a non-empty string.');
						}

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						if (!timelineSelectionRef.current.canSelect) {
							throw new Error('Studio sequence selection is unavailable.');
						}

						const timelineTrack = getCurrentTimeline().find(
							(candidate) => candidate.sequence.id === sequenceId,
						);
						if (!timelineTrack) {
							throw new Error(
								`Sequence ${sequenceId} not found in the current composition.`,
							);
						}

						const selection = getTimelineSelectionFromNodePathInfo(
							timelineTrack.nodePathInfo,
						);
						if (selection === null) {
							throw new Error(`Sequence ${sequenceId} cannot be selected.`);
						}

						timelineSelectionRef.current.selectItems([selection], {
							reveal: true,
						});
						return Promise.resolve({
							currentContent: currentContentRef.current,
							selectedSequence: serializeSequence(timelineTrack),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_composition',
					title: 'Get Studio composition',
					description:
						'Read the ID, source stack, duration, dimensions, frame rate, and current frame of the composition open in Remotion Studio. All fields are null when the canvas is not showing a composition.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const composition = currentCompositionDefinitionRef.current;
						if (composition === null) {
							return Promise.resolve({
								compositionName: null,
								stack: null,
								durationInFrames: null,
								height: null,
								width: null,
								fps: null,
								currentFrame: null,
							});
						}

						const metadata = currentCompositionMetadataRef.current;
						return Promise.resolve({
							compositionName: composition.id,
							stack: composition.stack,
							durationInFrames:
								metadata?.durationInFrames ??
								composition.durationInFrames ??
								null,
							height: metadata?.height ?? composition.height ?? null,
							width: metadata?.width ?? composition.width ?? null,
							fps: metadata?.fps ?? composition.fps ?? null,
							currentFrame: getCurrentFrame(),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_canvas_html',
					title: 'Get Studio canvas HTML',
					description:
						'Read the HTML of the rendered composition at the current frame. The result is limited to the composition canvas and does not include the Studio interface. Canvas and WebGL pixels are not included.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							return Promise.resolve({
								currentContent: currentContentRef.current,
								currentFrame: null,
								html: null,
								htmlLength: null,
								truncated: false,
							});
						}

						const outerHtml = Internals.portalNode().outerHTML;
						return Promise.resolve({
							currentContent: currentContentRef.current,
							currentFrame: getCurrentFrame(),
							html: outerHtml.slice(0, MAX_CANVAS_HTML_LENGTH),
							htmlLength: outerHtml.length,
							truncated: outerHtml.length > MAX_CANVAS_HTML_LENGTH,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_outlines',
					title: 'Get Studio canvas outlines',
					description:
						'Read the active selectable component outlines in the current Remotion Studio canvas, including sequence identity, source-code location, and geometry in composition pixels.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: async () => {
						const composition = currentCompositionDefinitionRef.current;
						if (composition === null) {
							return {
								currentContent: currentContentRef.current,
								currentFrame: null,
								outlines: [],
							};
						}

						const currentFrame = getCurrentFrame();
						const selectableOutlines =
							CanvasInternals.getCanvasSelectableOutlines({
								tracks: calculateTimeline({
									sequences: sequencesRef.current,
									overrideIdsToNodePaths:
										overrideIdToNodePathMappingsRef.current,
									compositions: compositionsRef.current,
								}).tracks,
								timelinePosition: currentFrame,
								resolveSequenceNodePathInfo: null,
							});
						const portalNode = Internals.portalNode();
						const portalRect = portalNode.getBoundingClientRect();
						if (portalRect.width === 0 || portalRect.height === 0) {
							throw new Error('The Studio canvas is not ready to be measured.');
						}

						const measuredOutlines = measureOutlineTargets(
							portalNode,
							selectableOutlines.map((outline) => {
								if (outline.sequence.refForOutline === null) {
									throw new Error('Expected an outline ref.');
								}

								return {
									key: outline.key,
									ref: outline.sequence.refForOutline,
									crop: {left: 0, right: 0, top: 0, bottom: 0},
									includeOutsideContainer: true,
								};
							}),
						);
						const measurementsByKey = new Map(
							measuredOutlines.map((outline) => [outline.key, outline]),
						);
						const contextByStack = new Map<
							string,
							Promise<Awaited<ReturnType<typeof getOriginalLocationFromStack>>>
						>();
						const outlines = await Promise.all(
							selectableOutlines.map(async (outline) => {
								const measurement = measurementsByKey.get(outline.key);
								if (!measurement) {
									return null;
								}

								const outlineStack = outline.sequence.getStack();
								let location = null;
								if (outlineStack !== null) {
									let promise = contextByStack.get(outlineStack);
									if (!promise) {
										promise = getOriginalLocationFromStack(
											outlineStack,
											'sequence',
										).catch(() => null);
										contextByStack.set(outlineStack, promise);
									}

									location = await promise;
								}

								const name =
									outline.sequence.displayName ||
									outline.sequence.controls?.componentName ||
									null;
								const {points} = measurement;
								const xValues = points.map((point) => point.x);
								const yValues = points.map((point) => point.y);
								const left = Math.min(...xValues);
								const top = Math.min(...yValues);
								const right = Math.max(...xValues);
								const bottom = Math.max(...yValues);

								return {
									sequenceId: outline.sequence.id,
									parentSequenceId: outline.sequence.parent,
									name,
									location: getRelativeFileLocation({
										location,
										root: window.remotion_cwd,
									}),
									geometry: {
										points,
										boundingBox: {
											x: left,
											y: top,
											width: right - left,
											height: bottom - top,
										},
									},
								};
							}),
						);

						return {
							currentContent: currentContentRef.current,
							currentFrame,
							outlines: outlines.filter(
								(outline): outline is NonNullable<typeof outline> =>
									outline !== null,
							),
						};
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_playback_state',
					title: 'Get Studio playback state',
					description:
						'Read the current frame, frame rate, duration, playing state, audio state, playback rate, looping state, and normalized timeline zoom for the composition or ready audio/video asset or render-output preview. All playback fields are null for unsupported or unready content. Render outputs have no timeline zoom and expose playbackStartFrame for returning to their last playback start with pause and seek_to_frame.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const target = getCurrentPlaybackTarget();
						if (target === null) {
							return Promise.resolve({
								currentContent: currentContentRef.current,
								currentFrame: null,
								playbackStartFrame: null,
								fps: null,
								durationInFrames: null,
								playing: null,
								muted: null,
								volume: null,
								playbackRate: null,
								looping: null,
								timelineZoom: null,
							});
						}

						if (target.type === 'output') {
							const state = target.output.getState();
							return Promise.resolve({
								currentContent: currentContentRef.current,
								currentFrame: state.frame,
								playbackStartFrame: state.playbackStartFrame,
								fps: state.fps,
								durationInFrames: state.durationInFrames,
								playing: state.playing,
								muted: state.muted,
								volume: state.volume,
								playbackRate: state.playbackRate,
								looping: state.loop,
								timelineZoom: null,
							});
						}

						const {durationInFrames} = target;
						const timelineViewportWidth =
							scrollableRef.current?.clientWidth ?? 0;
						const minZoom = getTimelineMinZoom({
							durationInFrames,
							timelineViewportWidth,
						});
						const timelineZoom = getTimelineZoom({
							durationInFrames,
							timelineViewportWidth,
							zoom: timelineZoomRef.current[target.id] ?? null,
						});

						return Promise.resolve({
							currentContent: currentContentRef.current,
							currentFrame: getCurrentFrame(),
							playbackStartFrame: null,
							fps: target.fps,
							durationInFrames: target.durationInFrames,
							playing: isPlaying(),
							muted: playerMutedRef.current,
							volume: mediaVolumeRef.current,
							playbackRate: playbackRateRef.current,
							looping: loadLoopOption(),
							timelineZoom: timelineZoomToNormalized({
								zoom: timelineZoom,
								minZoom,
							}),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_selection',
					title: 'Get Studio selection',
					description:
						'Read the current frame, canvas content (composition, asset, or output), and source-code context for the item currently selected in Remotion Studio. The selection matches "Copy context for agents".',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () =>
						Promise.resolve({
							currentFrame: getCurrentFrame(),
							currentSelection: currentSelectionRef.current,
							currentContent: currentContentRef.current,
							selectionType:
								timelineSelectionRef.current.selectedItems.length === 1
									? timelineSelectionRef.current.selectedItems[0].type
									: null,
							selectedSequence: selectedSequenceRef.current,
						}),
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'get_guides',
					title: 'Get Studio guides',
					description:
						'Read the guides for the current Remotion Studio composition. Vertical guide positions are x-coordinates from the left edge and horizontal guide positions are y-coordinates from the top edge, in composition pixels.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						const guidesAreVisible = editorShowGuidesRef.current;

						return Promise.resolve({
							currentContent: currentContentRef.current,
							guidesVisible: guidesAreVisible,
							guides:
								compositionId === null
									? []
									: guidesListRef.current
											.filter((guide) => guide.compositionId === compositionId)
											.map((guide) => ({
												id: guide.id,
												orientation: guide.orientation,
												position: guide.position,
												visible: guidesAreVisible && guide.show,
											})),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'set_guides_visible',
					title: 'Set Studio guides visibility',
					description:
						'Show or hide all guides for the current Remotion Studio composition.',
					inputSchema: {
						type: 'object',
						properties: {
							visible: {
								type: 'boolean',
								description: 'Whether guides should be visible.',
							},
						},
						required: ['visible'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({visible}) => {
						if (typeof visible !== 'boolean') {
							throw new Error('visible must be a boolean.');
						}

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						editorShowGuidesRef.current = visible;
						setEditorShowGuides(() => visible);
						return Promise.resolve({
							currentContent: currentContentRef.current,
							guidesVisible: visible,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'add_guide',
					title: 'Add Studio guide',
					description:
						'Add a guide to the current Remotion Studio composition. A vertical guide position is an x-coordinate from the left edge and a horizontal guide position is a y-coordinate from the top edge, in composition pixels.',
					inputSchema: {
						type: 'object',
						properties: {
							orientation: {
								type: 'string',
								enum: ['horizontal', 'vertical'],
								description: 'The orientation of the guide.',
							},
							position: {
								type: 'number',
								description:
									'The guide position in composition pixels. Vertical guides use an x-coordinate and horizontal guides use a y-coordinate.',
							},
						},
						required: ['orientation', 'position'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({orientation, position}) => {
						if (orientation !== 'horizontal' && orientation !== 'vertical') {
							throw new Error(
								'orientation must be either "horizontal" or "vertical".',
							);
						}

						if (typeof position !== 'number' || !Number.isFinite(position)) {
							throw new Error('position must be a finite number.');
						}

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						const guide: Guide = {
							id: crypto.randomUUID(),
							orientation,
							position,
							show: true,
							compositionId,
						};
						const nextGuides = [...guidesListRef.current, guide];
						guidesListRef.current = nextGuides;
						setGuidesList(() => nextGuides);
						persistGuidesList(nextGuides);
						editorShowGuidesRef.current = true;
						setEditorShowGuides(() => true);

						return Promise.resolve({
							currentContent: currentContentRef.current,
							guide: {
								id: guide.id,
								orientation: guide.orientation,
								position: guide.position,
								visible: true,
							},
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'remove_guide',
					title: 'Remove Studio guide',
					description:
						'Remove a guide from the current Remotion Studio composition by its guide ID.',
					inputSchema: {
						type: 'object',
						properties: {
							guideId: {
								type: 'string',
								minLength: 1,
								description:
									'The guide ID returned by get_guides or add_guide.',
							},
						},
						required: ['guideId'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({guideId}) => {
						if (typeof guideId !== 'string' || guideId.length === 0) {
							throw new Error('guideId must be a non-empty string.');
						}

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						const guideExists = guidesListRef.current.some(
							(guide) =>
								guide.id === guideId && guide.compositionId === compositionId,
						);
						if (!guideExists) {
							throw new Error(
								`Guide ${guideId} not found in the current composition.`,
							);
						}

						const nextGuides = guidesListRef.current.filter(
							(guide) =>
								guide.id !== guideId || guide.compositionId !== compositionId,
						);
						guidesListRef.current = nextGuides;
						setGuidesList(() => nextGuides);
						persistGuidesList(nextGuides);

						const removedGuideWasSelected =
							timelineSelectionRef.current.selectedItems.some(
								(item) => item.type === 'guide' && item.guideId === guideId,
							);
						if (removedGuideWasSelected) {
							timelineSelectionRef.current.clearSelection();
						}

						return Promise.resolve({
							currentContent: currentContentRef.current,
							guideId,
							removed: true,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'play',
					title: 'Play Studio preview',
					description:
						'Start playing the current Remotion Studio composition or ready audio/video asset or render-output preview from the current frame.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: async () => {
						const target = requireCurrentPlaybackTarget();
						const {durationInFrames} = target;

						if (target.type === 'timeline' && durationInFrames <= 1) {
							throw new Error(
								'The current preview has only one frame and cannot play.',
							);
						}

						if (target.type === 'output') {
							await target.output.play();
							if (
								getRenderOutputPlaybackTarget(
									compositionManagerRef.current.canvasContent,
								) !== target.output
							) {
								target.output.pause();
								throw new Error(
									'The rendered output preview changed while playback was starting.',
								);
							}

							return {
								currentContent: currentContentRef.current,
								playing: target.output.getState().playing,
							};
						}

						if (Internals.timeValueRef.current === null) {
							throw new Error('Studio playback controls are not ready.');
						}

						play();
						return Promise.resolve({
							currentContent: currentContentRef.current,
							playing: true,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'pause',
					title: 'Pause Studio preview',
					description:
						'Pause the current Remotion Studio composition or ready audio/video asset or render-output preview at the current frame.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const target = requireCurrentPlaybackTarget();
						if (target.type === 'output') {
							target.output.pause();
							return Promise.resolve({
								currentContent: currentContentRef.current,
								playing: false,
							});
						}

						if (Internals.timeValueRef.current === null) {
							throw new Error('Studio playback controls are not ready.');
						}

						pause();
						return Promise.resolve({
							currentContent: currentContentRef.current,
							playing: false,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'mute',
					title: 'Mute Studio preview',
					description:
						'Mute audio playback for the current Remotion Studio composition or ready audio/video asset or render-output preview.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const target = requireCurrentPlaybackTarget();

						if (target.type === 'output') target.output.setMuted(true);
						else {
							setPlayerMuted(true);
							persistMuteOption(true);
						}

						return Promise.resolve({
							currentContent: currentContentRef.current,
							muted: true,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'unmute',
					title: 'Unmute Studio preview',
					description:
						'Unmute audio playback for the current Remotion Studio composition or ready audio/video asset or render-output preview.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const target = requireCurrentPlaybackTarget();

						if (target.type === 'output') target.output.setMuted(false);
						else {
							setPlayerMuted(false);
							persistMuteOption(false);
						}

						return Promise.resolve({
							currentContent: currentContentRef.current,
							muted: false,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'set_volume',
					title: 'Set Studio preview volume',
					description:
						'Set playback volume from 0 to 1 for the current composition or ready audio/video preview in any Studio mode. Render-output volume is local to the mounted output. This does not change source audio settings or the muted state.',
					inputSchema: {
						type: 'object',
						properties: {
							volume: {
								type: 'number',
								minimum: 0,
								maximum: 1,
								description:
									'Playback volume from 0 (silent) to 1 (full volume).',
							},
						},
						required: ['volume'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({volume}) => {
						if (
							typeof volume !== 'number' ||
							!Number.isFinite(volume) ||
							volume < 0 ||
							volume > 1
						) {
							throw new Error(
								'volume must be a finite number between 0 and 1.',
							);
						}

						const target = requireCurrentPlaybackTarget();
						if (target.type === 'output') target.output.setVolume(volume);
						else {
							mediaVolumeRef.current = volume;
							setMediaVolume(volume);
						}

						return Promise.resolve({
							currentContent: currentContentRef.current,
							volume,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'set_timeline_zoom',
					title: 'Set Studio timeline zoom',
					description:
						'Set the timeline zoom for the current Remotion Studio composition or ready audio/video asset preview. Use 0 for fully zoomed out and 1 for the maximum zoom supported by the preview duration.',
					inputSchema: {
						type: 'object',
						properties: {
							zoom: {
								type: 'number',
								minimum: 0,
								maximum: 1,
								description:
									'The normalized timeline zoom, from 0 (fully zoomed out) to 1 (maximum zoom).',
							},
						},
						required: ['zoom'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({zoom}) => {
						if (
							typeof zoom !== 'number' ||
							!Number.isFinite(zoom) ||
							zoom < 0 ||
							zoom > 1
						) {
							throw new Error('zoom must be a finite number between 0 and 1.');
						}

						const target = requireCurrentPlaybackTarget();
						if (target.type === 'output') {
							throw new Error(
								'Render-output previews do not have timeline zoom.',
							);
						}

						const {id, durationInFrames} = target;
						if (durationInFrames <= 1) {
							throw new Error(
								'The current preview has only one frame and has no timeline zoom.',
							);
						}

						const timelineViewportWidth =
							scrollableRef.current?.clientWidth ?? 0;
						const minZoom = getTimelineMinZoom({
							durationInFrames,
							timelineViewportWidth,
						});
						const timelineZoom = clampTimelineZoom({
							zoom: normalizedToTimelineZoom({
								normalized: zoom,
								minZoom,
							}),
							durationInFrames,
							timelineViewportWidth,
						});
						setTimelineZoom(id, () => timelineZoom, {
							anchorFrame: null,
							anchorContentX: null,
						});

						return Promise.resolve({
							currentContent: currentContentRef.current,
							timelineZoom: timelineZoomToNormalized({
								zoom: timelineZoom,
								minZoom,
							}),
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'set_looping',
					title: 'Set Studio looping',
					description:
						'Enable or disable looping for the current Remotion Studio composition or ready audio/video preview. Render-output looping is local to the mounted output; composition and asset looping updates the Loop control and saved playback preference.',
					inputSchema: {
						type: 'object',
						properties: {
							looping: {
								type: 'boolean',
								description: 'Whether playback should loop at the end.',
							},
						},
						required: ['looping'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({looping}) => {
						if (typeof looping !== 'boolean') {
							throw new Error('looping must be a boolean.');
						}

						const target = requireCurrentPlaybackTarget();
						const {durationInFrames} = target;
						if (target.type === 'timeline' && durationInFrames <= 1) {
							throw new Error(
								'The current preview has only one frame and cannot loop.',
							);
						}

						if (target.type === 'output') {
							target.output.setLoop(looping);
							return Promise.resolve({
								currentContent: currentContentRef.current,
								looping,
							});
						}

						if (loopSetterRef.current === null) {
							throw new Error('Studio playback controls are not ready.');
						}

						loopSetterRef.current(() => {
							persistLoopOption(looping);
							return looping;
						});
						return Promise.resolve({
							currentContent: currentContentRef.current,
							looping,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'set_playback_rate',
					title: 'Set Studio playback rate',
					description:
						'Set the playback rate for the current Remotion Studio composition or ready audio/video preview. Negative values play backwards in compositions and assets; rendered outputs only support positive rates and keep their own rate.',
					inputSchema: {
						type: 'object',
						properties: {
							playbackRate: {
								type: 'number',
								enum: commonPlaybackRates,
								description:
									'The playback multiplier. Negative values play backwards.',
							},
						},
						required: ['playbackRate'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({playbackRate}) => {
						if (
							typeof playbackRate !== 'number' ||
							!commonPlaybackRates.includes(playbackRate)
						) {
							throw new Error(
								`playbackRate must be one of: ${commonPlaybackRates.join(', ')}.`,
							);
						}

						const target = requireCurrentPlaybackTarget();
						if (target.type === 'output') {
							if (playbackRate < 0)
								throw new Error(
									'Render-output previews do not support reverse playback.',
								);
							target.output.setPlaybackRate(playbackRate);
							return Promise.resolve({
								currentContent: currentContentRef.current,
								playbackRate: target.output.getState().playbackRate,
							});
						}

						setPlaybackRate(() => playbackRate);
						persistPlaybackRate(playbackRate);
						return Promise.resolve({
							currentContent: currentContentRef.current,
							playbackRate,
						});
					},
				},
				{signal: controller.signal},
			),
			modelContext.registerTool(
				{
					name: 'seek_to_frame',
					title: 'Seek Studio timeline',
					description:
						'Seek the current Remotion Studio composition or ready audio/video asset or render-output preview to a frame. Frames past the end are clamped to the final frame. Read get_playback_state for the preview frame rate and duration.',
					inputSchema: {
						type: 'object',
						properties: {
							frame: {
								type: 'integer',
								minimum: 0,
								description: 'The zero-based frame to seek to.',
							},
						},
						required: ['frame'],
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: ({frame}) => {
						if (typeof frame !== 'number' || !Number.isInteger(frame)) {
							throw new Error('frame must be an integer.');
						}

						const target = requireCurrentPlaybackTarget();
						const {durationInFrames} = target;
						if (
							target.type !== 'output' &&
							Internals.timeValueRef.current === null
						) {
							throw new Error('Studio playback controls are not ready.');
						}

						const currentFrame = Math.min(
							Math.max(0, frame),
							durationInFrames - 1,
						);
						if (target.type === 'output')
							target.output.seekToFrame(currentFrame);
						else seek(currentFrame);
						return Promise.resolve({
							currentFrame,
							currentContent: currentContentRef.current,
						});
					},
				},
				{signal: controller.signal},
			),
		]).catch(() => undefined);

		return () => {
			controller.abort();
		};
	}, [
		addCaptionJob,
		addVideoMattingJob,
		calculateTimeline,
		compositionManagerRef,
		isPlaying,
		propStatusesRef,
		renderQueueActions,
		renderJobRetry,
		selectComposition,
		sequencesRef,
		setEditorShowGuides,
		setGuidesList,
		setMediaVolume,
		setPlaybackRate,
		setPlayerMuted,
		setTimelineZoom,
		timelineSelectionRef,
	]);

	return (
		<WebMcpSelectionSync
			currentSelectionRef={currentSelectionRef}
			selectedSequenceRef={selectedSequenceRef}
		/>
	);
};
