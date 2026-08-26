import {useContext, useEffect, useMemo, useRef, type FC} from 'react';
import {Internals} from 'remotion';
import {formatContextForAgents} from '../helpers/format-file-location';
import {findTrackForNodePathInfo} from './Timeline/find-track-for-node-path-info';
import {getCurrentFrame} from './Timeline/imperative-state';
import {parseKeyframeFieldFromNodePath} from './Timeline/parse-keyframe-field-from-node-path';
import {useTimelineSelection} from './Timeline/TimelineSelection';
import {useResolveStackAndReactToChange} from './Timeline/use-resolved-stack-react-to-change';

type WebMcpTool = {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly inputSchema: Record<string, unknown>;
	readonly annotations: {readonly readOnlyHint: boolean};
	readonly execute: () => Promise<unknown>;
};

type WebMcpModelContext = {
	registerTool: (
		tool: WebMcpTool,
		options: {readonly signal: AbortSignal},
	) => Promise<void>;
};

const getNoStack = () => null;

export const WebMcp: FC = () => {
	const {selectedItems} = useTimelineSelection();
	const {canvasContent} = useContext(Internals.CompositionManager);
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
	const currentComposition =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const currentCompositionRef = useRef(currentComposition);
	currentCompositionRef.current = currentComposition;

	useEffect(() => {
		const {modelContext} = document as Document & {
			readonly modelContext?: WebMcpModelContext;
		};
		if (typeof modelContext?.registerTool !== 'function') {
			return;
		}

		const controller = new AbortController();
		modelContext
			.registerTool(
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
			)
			.catch(() => undefined);

		return () => {
			controller.abort();
		};
	}, []);

	return null;
};
