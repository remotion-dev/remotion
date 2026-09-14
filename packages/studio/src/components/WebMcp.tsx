import {isValidPackageName} from '@remotion/studio-shared';
import {useContext, useEffect, useMemo, useRef, type FC} from 'react';
import {Internals, staticFile} from 'remotion';
import {installPackages} from '../api/install-package';
import {pause} from '../api/pause';
import {play} from '../api/play';
import {restartStudio} from '../api/restart-studio';
import {seek} from '../api/seek';
import {shutDownStudio} from '../api/shut-down-studio';
import {getCurrentError} from '../error-overlay/current-error';
import {calculateTimeline} from '../helpers/calculate-timeline';
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
import {
	EditorShowGuidesContext,
	persistGuidesList,
	type Guide,
} from '../state/editor-guides';
import {loadLoopOption} from '../state/loop';
import {persistMuteOption} from '../state/mute';
import {commonPlaybackRates, persistPlaybackRate} from '../state/playbackrate';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {useSelectComposition} from './InitialCompositionLoader';
import {
	isOptionalPackageInstalled,
	markOptionalPackageInstalled,
} from './OptionalPackageModal';
import {
	getDefaultOutputBaseName,
	validatePublicOutputName,
} from './public-output-name';
import {RenderQueueContext} from './RenderQueue/context';
import {
	getSequencesWithSelectableOutlines,
	measureOutlineTargets,
} from './selected-outline-measurement';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getCurrentDuration, getCurrentFrame} from './Timeline/imperative-state';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {shouldShowTrackInTimeline} from './Timeline/should-show-track-in-timeline';
import {scrollableRef} from './Timeline/timeline-refs';
import {
	getTimelineSelectionFromNodePathInfo,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
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

export const WebMcp: FC = () => {
	const {addCaptionJob, addVideoMattingJob} = useContext(RenderQueueContext);
	const staticFiles = useStaticFiles();
	const {canSelect, clearSelection, selectedItems, selectItems} =
		useTimelineSelection();
	const {canvasContent, compositions, currentCompositionMetadata, folders} =
		useContext(Internals.CompositionManager);
	const {playbackRate: currentPlaybackRate, setPlaybackRate} =
		Internals.usePlaybackRate();
	const {isPlaying} = Internals.Timeline.useTimelineContext();
	const {mediaVolume, playerMuted} = useContext(Internals.MediaVolumeContext);
	const {setPlayerMuted} = useContext(Internals.SetMediaVolumeContext);
	const {setZoom: setTimelineZoom, zoom: timelineZoomMap} =
		useContext(TimelineZoomCtx);
	const selectComposition = useSelectComposition();
	const {editorShowGuides, guidesList, setEditorShowGuides, setGuidesList} =
		useContext(EditorShowGuidesContext);
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;
	const track = useMemo(() => {
		if (selectedItem === null || selectedItem.type === 'guide') {
			return null;
		}

		return (
			findTrackForNodePathInfo({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				nodePathInfo: selectedItem.nodePathInfo,
			}) ?? null
		);
	}, [overrideIdToNodePathMappings, selectedItem, sequences]);
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
		if (selectedItems.length === 0) {
			return null;
		}

		if (selectedItems.length > 1) {
			return null;
		}

		if (selectedItem === null || selectedItem.type === 'guide') {
			return null;
		}

		if (track === null) {
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
	const currentSelectionRef = useRef(currentSelection);
	currentSelectionRef.current = currentSelection;
	const selectedSequence = useMemo(
		() => (track === null ? null : serializeSequence(track)),
		[track],
	);
	const selectedSequenceRef = useRef(selectedSequence);
	selectedSequenceRef.current = selectedSequence;
	const selectedItemsRef = useRef(selectedItems);
	selectedItemsRef.current = selectedItems;
	const canSelectRef = useRef(canSelect);
	canSelectRef.current = canSelect;
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
	const sequencesRef = useRef(sequences);
	sequencesRef.current = sequences;
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
			}).filter((timelineTrack) =>
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
							audioStreamIndex: null,
							chunkLengthInSeconds,
							displayName,
							doSample,
							forceFullSequences,
							language: model.multilingual ? language : null,
							model: model.name,
							noRepeatNgramSize,
							outName: outputPath,
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
					name: 'separate_video_layers',
					title: 'Separate Studio video layers',
					description:
						'Separate a video asset from the public folder into background and foreground WebM files and add the work to the Jobs queue. If assetPath is omitted, the asset currently open in Studio is used.',
					inputSchema: {
						type: 'object',
						properties: {
							assetPath: {
								type: 'string',
								description:
									'Optional path relative to public/. Defaults to the asset currently open in Studio.',
							},
							baseOutputPath: {
								type: 'string',
								description:
									'Optional background output path relative to public/.',
							},
							foregroundOutputPath: {
								type: 'string',
								description:
									'Optional foreground output path relative to public/.',
							},
							model: {
								type: 'string',
								default: 'ben2-base',
							},
							audio: {
								type: 'string',
								enum: ['base', 'foreground', 'both', 'none'],
								default: 'base',
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
							throw new Error('The separation asset must be a video.');
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

						const audio = input.audio ?? 'base';
						if (
							audio !== 'base' &&
							audio !== 'foreground' &&
							audio !== 'both' &&
							audio !== 'none'
						) {
							throw new Error('audio must be base, foreground, both, or none.');
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
						const baseOutputPath =
							input.baseOutputPath ?? `${baseName}-base.webm`;
						const foregroundOutputPath =
							input.foregroundOutputPath ?? `${baseName}-foreground.webm`;
						if (
							typeof baseOutputPath !== 'string' ||
							typeof foregroundOutputPath !== 'string'
						) {
							throw new Error('Output paths must be strings.');
						}

						const baseError = validatePublicOutputName({
							extension: '.webm',
							outName: baseOutputPath,
						});
						const foregroundError = validatePublicOutputName({
							extension: '.webm',
							outName: foregroundOutputPath,
						});
						if (baseError !== null || foregroundError !== null) {
							throw new Error(
								baseError ?? foregroundError ?? 'Invalid output path.',
							);
						}

						if (
							baseOutputPath.normalize('NFC').toLowerCase() ===
							foregroundOutputPath.normalize('NFC').toLowerCase()
						) {
							throw new Error(
								'Background and foreground outputs must be different.',
							);
						}

						const jobId = addVideoMattingJob({
							audio,
							baseOutName: baseOutputPath,
							displayName,
							foregroundOutName: foregroundOutputPath,
							model,
							src,
							videoBitrate,
						});
						return {
							baseOutputPath,
							foregroundOutputPath,
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
						'Open a registered composition in Remotion Studio by name.',
					inputSchema: {
						type: 'object',
						properties: {
							compositionName: {
								type: 'string',
								description: 'The name of the composition to open.',
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

						selectComposition(composition, true);
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
						'Read the mounted sequences in the current Remotion Studio timeline, including their IDs, hierarchy, timing, type, source stack, and whether they can be selected.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: true},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						return Promise.resolve({
							currentContent: currentContentRef.current,
							sequences:
								compositionId === null
									? []
									: getCurrentTimeline().map(serializeSequence),
						});
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

						if (!canSelectRef.current) {
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

						selectItems([selection], {reveal: true});
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
						'Read the name, source stack, duration, dimensions, frame rate, and current frame of the composition open in Remotion Studio. All fields are null when the canvas is not showing a composition.',
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
						const selectableOutlines = getSequencesWithSelectableOutlines({
							sequences: sequencesRef.current,
							overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
							compositions: compositionsRef.current,
							timelinePosition: currentFrame,
						});
						const portalNode = Internals.portalNode();
						const portalRect = portalNode.getBoundingClientRect();
						const metadata = currentCompositionMetadataRef.current;
						const compositionWidth =
							metadata?.width ?? composition.width ?? portalNode.offsetWidth;
						const compositionHeight =
							metadata?.height ?? composition.height ?? portalNode.offsetHeight;
						const scaleX = portalRect.width / compositionWidth;
						const scaleY = portalRect.height / compositionHeight;
						if (
							!Number.isFinite(scaleX) ||
							scaleX === 0 ||
							!Number.isFinite(scaleY) ||
							scaleY === 0
						) {
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
								const points = measurement.points.map((point) => ({
									x: point.x / scaleX,
									y: point.y / scaleY,
								}));
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
						'Read the current frame, playing state, audio state, playback rate, looping state, and normalized timeline zoom for the composition open in Remotion Studio. All playback fields are null when the canvas is not showing a composition.',
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
								playing: null,
								muted: null,
								volume: null,
								playbackRate: null,
								looping: null,
								timelineZoom: null,
							});
						}

						const durationInFrames = getCurrentDuration();
						const timelineViewportWidth =
							scrollableRef.current?.clientWidth ?? 0;
						const minZoom = getTimelineMinZoom({
							durationInFrames,
							timelineViewportWidth,
						});
						const timelineZoom = getTimelineZoom({
							durationInFrames,
							timelineViewportWidth,
							zoom: timelineZoomRef.current[compositionId] ?? null,
						});

						return Promise.resolve({
							currentContent: currentContentRef.current,
							currentFrame: getCurrentFrame(),
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
								selectedItemsRef.current.length === 1
									? selectedItemsRef.current[0].type
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

						const removedGuideWasSelected = selectedItemsRef.current.some(
							(item) => item.type === 'guide' && item.guideId === guideId,
						);
						if (removedGuideWasSelected) {
							clearSelection();
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
					title: 'Play Studio composition',
					description:
						'Start playing the current Remotion Studio composition from the current frame.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						if (getCurrentDuration() <= 1) {
							throw new Error(
								'The current composition is a still and cannot play.',
							);
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
					title: 'Pause Studio composition',
					description:
						'Pause the current Remotion Studio composition at the current frame.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
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
					title: 'Mute Studio composition',
					description:
						'Mute audio playback for the current Remotion Studio composition.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						setPlayerMuted(true);
						persistMuteOption(true);
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
					title: 'Unmute Studio composition',
					description:
						'Unmute audio playback for the current Remotion Studio composition.',
					inputSchema: {
						type: 'object',
						properties: {},
						additionalProperties: false,
					},
					annotations: {readOnlyHint: false},
					execute: () => {
						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						setPlayerMuted(false);
						persistMuteOption(false);
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
					name: 'set_timeline_zoom',
					title: 'Set Studio timeline zoom',
					description:
						'Set the timeline zoom for the current Remotion Studio composition. Use 0 for fully zoomed out and 1 for the maximum zoom supported by the composition duration.',
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

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						const durationInFrames = getCurrentDuration();
						if (durationInFrames <= 1) {
							throw new Error(
								'The current composition is a still and has no timeline zoom.',
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
						setTimelineZoom(compositionId, () => timelineZoom, {
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
					name: 'set_playback_rate',
					title: 'Set Studio playback rate',
					description:
						'Set the playback rate for the current Remotion Studio composition. Negative values play the composition backwards.',
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

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
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
						'Seek the current Remotion Studio composition to a frame. Frames past the end of the composition are clamped to the final frame.',
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

						const compositionId = currentCompositionRef.current;
						if (compositionId === null) {
							throw new Error('No composition is currently selected.');
						}

						const currentFrame = Math.min(
							Math.max(0, frame),
							getCurrentDuration() - 1,
						);
						seek(currentFrame);
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
		clearSelection,
		isPlaying,
		selectComposition,
		selectItems,
		setEditorShowGuides,
		setGuidesList,
		setPlaybackRate,
		setPlayerMuted,
		setTimelineZoom,
	]);

	return null;
};
