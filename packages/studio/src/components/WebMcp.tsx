import {useContext, useEffect, useMemo, useRef, type FC} from 'react';
import {Internals} from 'remotion';
import {pause} from '../api/pause';
import {play} from '../api/play';
import {seek} from '../api/seek';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {createFolderTree} from '../helpers/create-folder-tree';
import {
	formatContextForAgents,
	getRelativeFileLocation,
} from '../helpers/format-file-location';
import {
	clampTimelineZoom,
	getTimelineMaxZoom,
	normalizedToTimelineZoom,
	TIMELINE_MIN_ZOOM,
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
	getSequencesWithSelectableOutlines,
	measureOutlineTargets,
} from './selected-outline-measurement';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getCurrentDuration, getCurrentFrame} from './Timeline/imperative-state';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {shouldShowTrackInTimeline} from './Timeline/should-show-track-in-timeline';
import {
	getTimelineSelectionFromNodePathInfo,
	useTimelineSelection,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {useResolveStackAndReactToChange} from './Timeline/use-resolved-stack-react-to-change';

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

export const WebMcp: FC = () => {
	const {canSelect, clearSelection, selectedItems, selectItems} =
		useTimelineSelection();
	const {canvasContent, compositions, currentCompositionMetadata, folders} =
		useContext(Internals.CompositionManager);
	const {playbackRate: currentPlaybackRate, setPlaybackRate} =
		Internals.usePlaybackRate();
	const {playbackStore} = Internals.Timeline.useTimelineContext();
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
						return Promise.resolve({currentComposition: composition.id});
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
								currentComposition: null,
								currentFrame: null,
								html: null,
								htmlLength: null,
								truncated: false,
							});
						}

						const outerHtml = Internals.portalNode().outerHTML;
						return Promise.resolve({
							currentComposition: compositionId,
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
								currentComposition: null,
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
							currentComposition: composition.id,
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
								currentComposition: null,
								currentFrame: null,
								playing: null,
								muted: null,
								volume: null,
								playbackRate: null,
								looping: null,
								timelineZoom: null,
							});
						}

						return Promise.resolve({
							currentComposition: compositionId,
							currentFrame: getCurrentFrame(),
							playing: playbackStore.store.getSnapshot().playing as boolean,
							muted: playerMutedRef.current,
							volume: mediaVolumeRef.current,
							playbackRate: playbackRateRef.current,
							looping: loadLoopOption(),
							timelineZoom: timelineZoomToNormalized({
								zoom:
									timelineZoomRef.current[compositionId] ?? TIMELINE_MIN_ZOOM,
								maxZoom: getTimelineMaxZoom(getCurrentDuration()),
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
						'Read the current frame, composition, and source-code context for the item currently selected in Remotion Studio. The selection matches "Copy context for agents".',
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
							currentComposition: currentCompositionRef.current,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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

						const maxZoom = getTimelineMaxZoom(durationInFrames);
						const timelineZoom = clampTimelineZoom({
							zoom: normalizedToTimelineZoom({
								normalized: zoom,
								maxZoom,
							}),
							durationInFrames,
						});
						setTimelineZoom(compositionId, () => timelineZoom, {
							anchorFrame: null,
							anchorContentX: null,
						});

						return Promise.resolve({
							currentComposition: compositionId,
							timelineZoom: timelineZoomToNormalized({
								zoom: timelineZoom,
								maxZoom,
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
							currentComposition: compositionId,
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
							currentComposition: compositionId,
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
		clearSelection,
		playbackStore,
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
