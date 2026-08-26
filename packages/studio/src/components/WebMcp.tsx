import {useContext, useEffect, useMemo, useRef, type FC} from 'react';
import {Internals} from 'remotion';
import {pause} from '../api/pause';
import {play} from '../api/play';
import {seek} from '../api/seek';
import {createFolderTree} from '../helpers/create-folder-tree';
import {formatContextForAgents} from '../helpers/format-file-location';
import {clampTimelineZoom} from '../helpers/get-timeline-max-zoom';
import {
	EditorShowGuidesContext,
	persistGuidesList,
	type Guide,
} from '../state/editor-guides';
import {persistMuteOption} from '../state/mute';
import {commonPlaybackRates, persistPlaybackRate} from '../state/playbackrate';
import {TimelineZoomCtx} from '../state/timeline-zoom';
import {useSelectComposition} from './InitialCompositionLoader';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getCurrentDuration, getCurrentFrame} from './Timeline/imperative-state';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {useTimelineSelection} from './Timeline/TimelineSelection';
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

export const WebMcp: FC = () => {
	const {clearSelection, selectedItems} = useTimelineSelection();
	const {canvasContent, compositions, currentCompositionMetadata, folders} =
		useContext(Internals.CompositionManager);
	const {setPlaybackRate} = Internals.usePlaybackRate();
	const {setPlayerMuted} = useContext(Internals.SetMediaVolumeContext);
	const {setZoom: setTimelineZoom} = useContext(TimelineZoomCtx);
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
	const selectedItemsRef = useRef(selectedItems);
	selectedItemsRef.current = selectedItems;
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
	const foldersRef = useRef(folders);
	foldersRef.current = folders;
	const currentCompositionMetadataRef = useRef(currentCompositionMetadata);
	currentCompositionMetadataRef.current = currentCompositionMetadata;
	const guidesListRef = useRef(guidesList);
	guidesListRef.current = guidesList;
	const editorShowGuidesRef = useRef(editorShowGuides);
	editorShowGuidesRef.current = editorShowGuides;

	useEffect(() => {
		const {modelContext} = document as Document & {
			readonly modelContext?: WebMcpModelContext;
		};
		if (typeof modelContext?.registerTool !== 'function') {
			return;
		}

		const controller = new AbortController();
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
						'Set the timeline zoom factor for the current Remotion Studio composition. The zoom is clamped to the range supported by the composition duration.',
					inputSchema: {
						type: 'object',
						properties: {
							zoom: {
								type: 'number',
								exclusiveMinimum: 0,
								description: 'The requested timeline zoom factor.',
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
							zoom <= 0
						) {
							throw new Error('zoom must be a positive finite number.');
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

						const timelineZoom = clampTimelineZoom({
							zoom,
							durationInFrames,
						});
						setTimelineZoom(compositionId, () => timelineZoom, {
							anchorFrame: null,
							anchorContentX: null,
						});

						return Promise.resolve({
							currentComposition: compositionId,
							timelineZoom,
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
		selectComposition,
		setEditorShowGuides,
		setGuidesList,
		setPlaybackRate,
		setPlayerMuted,
		setTimelineZoom,
	]);

	return null;
};
