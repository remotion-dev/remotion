import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {studioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {useKeybinding} from '../helpers/use-keybinding';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	getSelectedOutlineActiveSchema,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import {type SelectedOutline} from './selected-outline-geometry';
import {
	getSelectedEffectFieldsBySequenceKey,
	getSelectedSequenceKeys,
	getSelectedTransformOriginInfo,
	getSequenceKeysContainingSelection,
	getSequencesWithSelectableOutlines,
	measureOutlines,
	outlinesAreEqual,
} from './selected-outline-measurement';
import {
	getSelectedOutlineSnapTargets,
	selectedOutlineSnapIndicatorColor,
	type SelectedOutlineSnapPoint,
} from './selected-outline-snap';
import {
	rotateFieldKey,
	scaleFieldKey,
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineKeyboardNudgeSession,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {getSelectedUvHandles} from './selected-outline-uv';
import {
	SelectedOutlineElement,
	SelectedOutlineTransformOriginHandle,
} from './SelectedOutlineElement';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import {callAddSequenceKeyframe} from './Timeline/call-add-keyframe';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {
	useTimelineSelection,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';

export {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
	getSelectedOutlineActiveSchema,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDelta,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineRotationDragChanges,
	getSelectedOutlineRotationDragStates,
	getSelectedOutlineRotationDragValues,
	getSelectedOutlineScaleDragChanges,
	getSelectedOutlineScaleDragStates,
	getSelectedOutlineScaleDragValues,
	getSelectedOutlineScaleEdgeInfo,
	getSelectedOutlineTransformOriginLockedAxis,
	isSelectedOutlineDragPastThreshold,
	selectedOutlineTransformOriginSnapThresholdPx,
	selectedOutlineUvSnapThresholdPx,
	snapSelectedOutlineRotationDeltaDegrees,
	snapSelectedOutlineTransformOriginUv,
	snapSelectedOutlineUv,
} from './selected-outline-drag';
export {
	getOutlineDoubleClickAction,
	getOutlineSelectionInteraction,
	getSelectedEffectFieldsBySequenceKey,
	getSelectedOutlineRotationCornerInfo,
	getSelectedOutlineRotationDeltaDegrees,
	getSelectedOutlineRotationPivot,
	getSelectedSequenceKeys,
	getSequencesWithSelectableOutlines,
	getTransformedSvgViewportPoints,
} from './selected-outline-measurement';
export {selectedOutlineDragThresholdPx} from './selected-outline-types';
export type {
	SelectedOutlineDragState,
	SelectedOutlineRotationDragState,
	SelectedOutlineScaleDragState,
} from './selected-outline-types';

const outlineContainer: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	overflow: 'visible',
};

const SelectedOutlineSnapIndicators: React.FC<{
	readonly activeSnapPoints: readonly SelectedOutlineSnapPoint[];
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
}> = ({activeSnapPoints, compositionHeight, compositionWidth, scale}) => {
	if (activeSnapPoints.length === 0) {
		return null;
	}

	return (
		<g pointerEvents="none">
			{activeSnapPoints.map((snapPoint) => {
				if (snapPoint.target.axis === 'x') {
					const x = snapPoint.target.position * scale;
					return (
						<line
							key={`${snapPoint.target.axis}-${snapPoint.target.type}-${snapPoint.target.position}-${snapPoint.edge}`}
							x1={x}
							x2={x}
							y1={0}
							y2={compositionHeight * scale}
							stroke={selectedOutlineSnapIndicatorColor}
							strokeWidth={1}
							vectorEffect="non-scaling-stroke"
						/>
					);
				}

				const y = snapPoint.target.position * scale;
				return (
					<line
						key={`${snapPoint.target.axis}-${snapPoint.target.type}-${snapPoint.target.position}-${snapPoint.edge}`}
						x1={0}
						x2={compositionWidth * scale}
						y1={y}
						y2={y}
						stroke={selectedOutlineSnapIndicatorColor}
						strokeWidth={1}
						vectorEffect="non-scaling-stroke"
					/>
				);
			})}
		</g>
	);
};

const outlinePointEqualityTolerance = 0.5;
const outlineAreaEqualityTolerance = 0.5;
const outlineBoundsOverlapTolerance = 0.5;

const outlinePointsAreEquivalent = (
	a: SelectedOutline['points'][number],
	b: SelectedOutline['points'][number],
) => {
	return (
		Math.abs(a.x - b.x) <= outlinePointEqualityTolerance &&
		Math.abs(a.y - b.y) <= outlinePointEqualityTolerance
	);
};

const outlinesHaveEquivalentHitArea = (
	a: SelectedOutline,
	b: SelectedOutline,
): boolean => {
	if (a.points.length !== b.points.length) {
		return false;
	}

	for (let startIndex = 0; startIndex < b.points.length; startIndex++) {
		for (const direction of [1, -1]) {
			const pointsMatch = a.points.every((point, index) => {
				const bIndex =
					(startIndex + direction * index + b.points.length) % b.points.length;
				return outlinePointsAreEquivalent(point, b.points[bIndex]);
			});

			if (pointsMatch) {
				return true;
			}
		}
	}

	return false;
};

const getOutlineHitArea = (outline: SelectedOutline): number => {
	let area = 0;

	for (let i = 0; i < outline.points.length; i++) {
		const current = outline.points[i];
		const next = outline.points[(i + 1) % outline.points.length];
		area += current.x * next.y - next.x * current.y;
	}

	return Math.abs(area) / 2;
};

const getOutlineBounds = (outline: SelectedOutline) => {
	const xs = outline.points.map((point) => point.x);
	const ys = outline.points.map((point) => point.y);

	return {
		maxX: Math.max(...xs),
		maxY: Math.max(...ys),
		minX: Math.min(...xs),
		minY: Math.min(...ys),
	};
};

const outlineBoundsOverlap = (
	a: SelectedOutline,
	b: SelectedOutline,
): boolean => {
	const aBounds = getOutlineBounds(a);
	const bBounds = getOutlineBounds(b);

	return (
		aBounds.minX <= bBounds.maxX + outlineBoundsOverlapTolerance &&
		aBounds.maxX + outlineBoundsOverlapTolerance >= bBounds.minX &&
		aBounds.minY <= bBounds.maxY + outlineBoundsOverlapTolerance &&
		aBounds.maxY + outlineBoundsOverlapTolerance >= bBounds.minY
	);
};

type OutlineSequenceParent = {
	readonly id: string;
	readonly parent: string | null;
};

const getSequenceId = (target: SelectedOutlineTarget | undefined) => {
	return target?.sequence?.id ?? null;
};

const getParentBySequenceId = ({
	sequences,
	targetsByKey,
}: {
	readonly sequences: readonly OutlineSequenceParent[];
	readonly targetsByKey: ReadonlyMap<string, SelectedOutlineTarget>;
}) => {
	const parentBySequenceId = new Map<string, string | null>();

	for (const sequence of sequences) {
		parentBySequenceId.set(sequence.id, sequence.parent);
	}

	for (const target of targetsByKey.values()) {
		const sequenceId = getSequenceId(target);
		if (sequenceId !== null && !parentBySequenceId.has(sequenceId)) {
			parentBySequenceId.set(sequenceId, target.sequence.parent);
		}
	}

	return parentBySequenceId;
};

const isAncestorTarget = ({
	ancestor,
	descendant,
	parentBySequenceId,
}: {
	readonly ancestor: SelectedOutlineTarget;
	readonly descendant: SelectedOutlineTarget;
	readonly parentBySequenceId: ReadonlyMap<string, string | null>;
}): boolean => {
	const ancestorId = getSequenceId(ancestor);
	if (ancestorId === null) {
		return false;
	}

	let parentId = descendant.sequence?.parent ?? null;
	while (parentId !== null) {
		if (parentId === ancestorId) {
			return true;
		}

		parentId = parentBySequenceId.get(parentId) ?? null;
	}

	return false;
};

const orderOutlineGroup = ({
	outlines,
	parentBySequenceId,
	targetsByKey,
}: {
	readonly outlines: readonly SelectedOutline[];
	readonly parentBySequenceId: ReadonlyMap<string, string | null>;
	readonly targetsByKey: ReadonlyMap<string, SelectedOutlineTarget>;
}): readonly SelectedOutline[] => {
	const incomingEdges = new Map<string, Set<string>>();
	const outgoingEdges = new Map<string, Set<string>>();
	const outlinesByKey = new Map(
		outlines.map((outline) => [outline.key, outline]),
	);

	for (const outline of outlines) {
		incomingEdges.set(outline.key, new Set());
		outgoingEdges.set(outline.key, new Set());
	}

	const hasPath = ({
		fromKey,
		seen,
		toKey,
	}: {
		readonly fromKey: string;
		readonly seen: Set<string>;
		readonly toKey: string;
	}): boolean => {
		if (fromKey === toKey) {
			return true;
		}

		if (seen.has(fromKey)) {
			return false;
		}

		seen.add(fromKey);
		for (const nextKey of outgoingEdges.get(fromKey) ?? []) {
			if (hasPath({fromKey: nextKey, seen, toKey})) {
				return true;
			}
		}

		return false;
	};

	const addEdge = (
		before: SelectedOutline,
		after: SelectedOutline,
		options?: {readonly skipIfCycle: boolean},
	) => {
		if (before.key === after.key) {
			return;
		}

		const incoming = incomingEdges.get(after.key);
		const outgoing = outgoingEdges.get(before.key);
		if (incoming === undefined || outgoing === undefined) {
			throw new Error('Expected outline to be registered before adding edge');
		}

		if (outgoing.has(after.key)) {
			return;
		}

		if (hasPath({fromKey: after.key, seen: new Set(), toKey: before.key})) {
			if (options?.skipIfCycle) {
				return;
			}

			throw new Error('Could not determine a stable outline rendering order');
		}

		incoming.add(before.key);
		outgoing.add(after.key);
	};

	const addAncestorConstraint = ({
		ancestor,
		descendant,
		descendantContainsSelection,
		equivalentHitArea,
	}: {
		readonly ancestor: SelectedOutline;
		readonly descendant: SelectedOutline;
		readonly descendantContainsSelection: boolean;
		readonly equivalentHitArea: boolean;
	}) => {
		// Usually, children should be above parents so nested elements are directly
		// selectable. If an unselected child has the same hit area as its parent, put
		// it below the parent so the wrapper can be selected. Once the child or
		// one of its properties is selected, keep it above the parent so it remains
		// directly draggable.
		if (equivalentHitArea && !descendantContainsSelection) {
			addEdge(descendant, ancestor);
		} else {
			addEdge(ancestor, descendant);
		}
	};

	const outlineBySequenceId = new Map<string, SelectedOutline>();
	for (const outline of outlines) {
		const sequenceId = getSequenceId(targetsByKey.get(outline.key));
		if (sequenceId !== null) {
			outlineBySequenceId.set(sequenceId, outline);
		}
	}

	// Only constrain each outline against its nearest rendered ancestor. The
	// resulting graph follows the sequence tree, so pairwise subpixel equivalence
	// cannot introduce contradictory edges across three nested outlines.
	for (const descendant of outlines) {
		const descendantTarget = targetsByKey.get(descendant.key);
		let parentId = descendantTarget?.sequence?.parent ?? null;

		while (parentId !== null) {
			const ancestor = outlineBySequenceId.get(parentId);
			if (ancestor !== undefined) {
				addAncestorConstraint({
					ancestor,
					descendant,
					descendantContainsSelection:
						(descendantTarget?.selected ?? false) ||
						(descendantTarget?.containsSelection ?? false),
					equivalentHitArea: outlinesHaveEquivalentHitArea(
						ancestor,
						descendant,
					),
				});
				break;
			}

			parentId = parentBySequenceId.get(parentId) ?? null;
		}
	}

	// For unrelated overlapping outlines, put broader hit targets below
	// smaller ones so a large selected sequence cannot swallow clicks on
	// a more specific element in the same canvas area.
	for (let i = 0; i < outlines.length; i++) {
		for (let j = i + 1; j < outlines.length; j++) {
			const a = outlines[i];
			const b = outlines[j];
			const aTarget = targetsByKey.get(a.key);
			const bTarget = targetsByKey.get(b.key);

			if (aTarget === undefined || bTarget === undefined) {
				continue;
			}

			const aAncestorOfB = isAncestorTarget({
				ancestor: aTarget,
				descendant: bTarget,
				parentBySequenceId,
			});
			const bAncestorOfA = isAncestorTarget({
				ancestor: bTarget,
				descendant: aTarget,
				parentBySequenceId,
			});

			if (aAncestorOfB || bAncestorOfA || !outlineBoundsOverlap(a, b)) {
				continue;
			}

			const aArea = getOutlineHitArea(a);
			const bArea = getOutlineHitArea(b);

			if (Math.abs(aArea - bArea) <= outlineAreaEqualityTolerance) {
				continue;
			}

			if (aArea > bArea) {
				addEdge(a, b, {skipIfCycle: true});
			} else {
				addEdge(b, a, {skipIfCycle: true});
			}
		}
	}

	const emitted = new Set<string>();
	const visiting = new Set<string>();
	const ordered: SelectedOutline[] = [];

	const visit = (outline: SelectedOutline) => {
		if (emitted.has(outline.key)) {
			return;
		}

		if (visiting.has(outline.key)) {
			throw new Error('Could not determine a stable outline rendering order');
		}

		visiting.add(outline.key);
		for (const dependencyKey of incomingEdges.get(outline.key) ?? []) {
			const dependency = outlinesByKey.get(dependencyKey);
			if (dependency === undefined) {
				throw new Error('Expected outline dependency to exist');
			}

			visit(dependency);
		}

		visiting.delete(outline.key);
		emitted.add(outline.key);
		ordered.push(outline);
	};

	for (const outline of outlines) {
		visit(outline);
	}

	return ordered;
};

export const orderOutlinesForRendering = ({
	outlines,
	sequences,
	targetsByKey,
}: {
	readonly outlines: readonly SelectedOutline[];
	readonly sequences: readonly OutlineSequenceParent[];
	readonly targetsByKey: ReadonlyMap<string, SelectedOutlineTarget>;
}): readonly SelectedOutline[] => {
	const parentBySequenceId = getParentBySequenceId({sequences, targetsByKey});

	return orderOutlineGroup({
		outlines,
		parentBySequenceId,
		targetsByKey,
	});
};

export const SelectedOutlineOverlay: React.FC<{
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly scale: number;
	readonly translationX: number;
	readonly translationY: number;
}> = ({
	compositionHeight,
	compositionWidth,
	scale,
	translationX,
	translationY,
}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {getScaleLockState} = useContext(ScaleLockContext);
	const {editorShowOutlines} = useContext(EditorShowOutlinesContext);
	const {editorShowGuides, guidesList} = useContext(EditorShowGuidesContext);
	const {frameBack, frameForward, getCurrentFrame, seek} =
		PlayerInternals.usePlayer();
	const keybindings = useKeybinding();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const [hoveredOutlineKey, setHoveredOutlineKey] = useState<string | null>(
		null,
	);
	const [draggingOutline, setDraggingOutline] = useState(false);
	const [activeSnapPoints, setActiveSnapPoints] = useState<
		readonly SelectedOutlineSnapPoint[]
	>([]);
	const overlayRef = useRef<SVGSVGElement>(null);
	const keyboardNudgeSessionRef =
		useRef<SelectedOutlineKeyboardNudgeSession | null>(null);
	const saveKeyboardNudgeSessionRef = useRef<() => void>(() => undefined);

	const onDraggingChange = React.useCallback((dragging: boolean) => {
		setDraggingOutline(dragging);
		if (dragging) {
			setHoveredOutlineKey(null);
		} else {
			setActiveSnapPoints([]);
		}
	}, []);
	const onSnapPointsChange = useCallback(
		(snapPoints: readonly SelectedOutlineSnapPoint[]) => {
			setActiveSnapPoints(snapPoints);
		},
		[],
	);
	const selectOutlineItem = useCallback(
		(item: TimelineSelection, interaction?: TimelineSelectionInteraction) => {
			selectItem(item, interaction, undefined, {reveal: true});
		},
		[selectItem],
	);

	const outlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!studioInteractivityEnabled || !editorShowOutlines) {
			return [];
		}

		const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
		const sequenceKeysContainingSelection =
			getSequenceKeysContainingSelection(selectedItems);
		const selectedEffectsBySequenceKey =
			getSelectedEffectFieldsBySequenceKey(selectedItems);
		const selectedTransformOriginInfo =
			getSelectedTransformOriginInfo(selectedItems);
		const clientId =
			previewServerState.type === 'connected'
				? previewServerState.clientId
				: null;

		return getSequencesWithSelectableOutlines({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		}).map(({key, keyframeDisplayOffset, nodePathInfo, sequence}) => {
			if (sequence.refForOutline === null) {
				throw new Error('Expected sequence to have a ref for outline');
			}

			const selected = selectedSequenceKeys.has(key);
			const containsSelection = sequenceKeysContainingSelection.has(key);
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			const {controls} = sequence;
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const sourceFrame = timelinePosition - keyframeDisplayOffset;
			const dragOverrides = getDragOverrides(nodePath) ?? {};
			const activeSchema = controls
				? getSelectedOutlineActiveSchema({
						schema: controls.schema,
						currentRuntimeValueDotNotation:
							controls.currentRuntimeValueDotNotation,
						dragOverrides,
						propStatus: nodePropStatuses,
						frame: sourceFrame,
					})
				: null;
			const fieldSchema = activeSchema?.[translateFieldKey];
			const propStatus = nodePropStatuses?.[translateFieldKey];
			const scaleFieldSchema = activeSchema?.[scaleFieldKey];
			const scalePropStatus = nodePropStatuses?.[scaleFieldKey];
			const rotationFieldSchema = activeSchema?.[rotateFieldKey];
			const rotationPropStatus = nodePropStatuses?.[rotateFieldKey];
			const transformOriginFieldSchema =
				activeSchema?.[transformOriginFieldKey];
			const transformOriginPropStatus =
				nodePropStatuses?.[transformOriginFieldKey];
			const textContentFieldSchema = activeSchema?.children;
			const textContentPropStatus = nodePropStatuses?.children;
			const transformOriginValueForRotation =
				transformOriginFieldSchema?.type === 'transform-origin' &&
				(transformOriginPropStatus?.status === 'static' ||
					transformOriginPropStatus?.status === 'keyframed')
					? String(
							Internals.getEffectiveVisualModeValue({
								propStatus: transformOriginPropStatus,
								dragOverrideValue: dragOverrides[transformOriginFieldKey],
								defaultValue: transformOriginFieldSchema.default,
								frame: sourceFrame,
								shouldResortToDefaultValueIfUndefined: true,
							}) ?? transformOriginFieldSchema.default,
						)
					: '50% 50%';
			const canDragStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canRotationDragStatus =
				rotationPropStatus?.status === 'static' ||
				(rotationPropStatus?.status === 'keyframed' &&
					rotationPropStatus.interpolationFunction === 'interpolate');
			const canDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				fieldSchema?.type === 'translate' &&
				canDragStatus;
			const canScaleDragStatus =
				scalePropStatus?.status === 'static' ||
				(scalePropStatus?.status === 'keyframed' &&
					scalePropStatus.interpolationFunction === 'interpolate');
			const canScaleDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				scaleFieldSchema?.type === 'scale' &&
				canScaleDragStatus;
			const canRotationDrag =
				previewServerState.type === 'connected' &&
				controls !== null &&
				rotationFieldSchema?.type === 'rotation-css' &&
				canRotationDragStatus;
			const selectedForTransformOrigin =
				selectedTransformOriginInfo?.sequenceKey === key;
			const transformOriginSourceFrame =
				selectedTransformOriginInfo?.displayFrame === null ||
				selectedTransformOriginInfo?.displayFrame === undefined
					? sourceFrame
					: selectedTransformOriginInfo.displayFrame - keyframeDisplayOffset;
			const canTransformOriginStatus =
				transformOriginPropStatus?.status === 'static' ||
				(transformOriginPropStatus?.status === 'keyframed' &&
					transformOriginPropStatus.interpolationFunction === 'interpolate');
			const canTransformOriginTranslateStatus =
				propStatus?.status === 'static' ||
				(propStatus?.status === 'keyframed' &&
					propStatus.interpolationFunction === 'interpolate');
			const canTransformOriginDrag =
				previewServerState.type === 'connected' &&
				selectedForTransformOrigin &&
				controls !== null &&
				transformOriginFieldSchema?.type === 'transform-origin' &&
				fieldSchema?.type === 'translate' &&
				canTransformOriginStatus &&
				canTransformOriginTranslateStatus;
			const canDropEffect =
				previewServerState.type === 'connected' &&
				controls?.supportsEffects === true;
			const canTextEdit =
				previewServerState.type === 'connected' &&
				controls !== null &&
				textContentFieldSchema?.type === 'text-content' &&
				textContentPropStatus !== undefined;

			return {
				key,
				containsSelection,
				effectDrop: canDropEffect
					? {
							clientId: previewServerState.clientId,
							fileName: nodePath.absolutePath,
							nodePath,
						}
					: null,
				nodePathInfo,
				ref: sequence.refForOutline,
				selected,
				selection: {type: 'sequence', nodePathInfo},
				sequence,
				drag: canDrag
					? {
							propStatus,
							clientId: previewServerState.clientId,
							fieldDefault: fieldSchema.default,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
						}
					: null,
				scaleDrag: canScaleDrag
					? {
							propStatus: scalePropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: scaleFieldSchema.default,
							fieldSchema: scaleFieldSchema,
							keyframeDisplayOffset,
							linked: getScaleLockState({
								nodePath,
								fieldKey: scaleFieldKey,
								defaultValue: (() => {
									const dragOverrideValue = dragOverrides[scaleFieldKey];
									const effectiveValue = Internals.getEffectiveVisualModeValue({
										propStatus: scalePropStatus,
										dragOverrideValue,
										defaultValue: scaleFieldSchema.default,
										shouldResortToDefaultValueIfUndefined: true,
									});
									const [x, y] =
										NoReactInternals.parseScaleValue(effectiveValue);
									return x === y;
								})(),
							}),
							nodePath,
							schema: controls.schema,
						}
					: null,
				rotationDrag: canRotationDrag
					? {
							propStatus: rotationPropStatus,
							clientId: previewServerState.clientId,
							fieldDefault: rotationFieldSchema.default,
							fieldSchema: rotationFieldSchema,
							keyframeDisplayOffset,
							nodePath,
							schema: controls.schema,
							transformOriginValue: transformOriginValueForRotation,
						}
					: null,
				transformOriginDrag: canTransformOriginDrag
					? {
							clientId: previewServerState.clientId,
							keyframeDisplayOffset,
							nodePath,
							originDefault: transformOriginFieldSchema.default,
							originPropStatus: transformOriginPropStatus,
							originValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus: transformOriginPropStatus,
									dragOverrideValue: dragOverrides[transformOriginFieldKey],
									defaultValue: transformOriginFieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? transformOriginFieldSchema.default,
							),
							rotateValue: String(
								rotationPropStatus?.status === 'static' ||
									rotationPropStatus?.status === 'keyframed'
									? (Internals.getEffectiveVisualModeValue({
											propStatus: rotationPropStatus,
											dragOverrideValue: dragOverrides[rotateFieldKey],
											defaultValue:
												rotationFieldSchema?.type === 'rotation-css'
													? rotationFieldSchema.default
													: '0deg',
											frame: transformOriginSourceFrame,
											shouldResortToDefaultValueIfUndefined: true,
										}) ?? '0deg')
									: '0deg',
							),
							scaleValue:
								scalePropStatus?.status === 'static' ||
								scalePropStatus?.status === 'keyframed'
									? String(
											Internals.getEffectiveVisualModeValue({
												propStatus: scalePropStatus,
												dragOverrideValue: dragOverrides[scaleFieldKey],
												defaultValue:
													scaleFieldSchema?.type === 'scale'
														? scaleFieldSchema.default
														: 1,
												frame: transformOriginSourceFrame,
												shouldResortToDefaultValueIfUndefined: true,
											}) ?? 1,
										)
									: '1',
							schema: controls.schema,
							sourceFrame: transformOriginSourceFrame,
							translateDefault: fieldSchema.default,
							translatePropStatus: propStatus,
							translateValue: String(
								Internals.getEffectiveVisualModeValue({
									propStatus,
									dragOverrideValue: dragOverrides[translateFieldKey],
									defaultValue: fieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? fieldSchema.default,
							),
						}
					: null,
				textEdit: canTextEdit
					? {
							nodePath,
							propStatus: textContentPropStatus,
						}
					: null,
				uvHandles: containsSelection
					? getSelectedUvHandles({
							propStatuses,
							clientId,
							getEffectDragOverrides,
							nodePath,
							selectedEffects: selectedEffectsBySequenceKey.get(key),
							sequence,
							sourceFrame: timelinePosition - keyframeDisplayOffset,
						})
					: [],
			};
		});
	}, [
		propStatuses,
		getDragOverrides,
		getEffectDragOverrides,
		getScaleLockState,
		editorShowOutlines,
		overrideIdToNodePathMappings,
		previewServerState,
		selectedItems,
		sequences,
		timelinePosition,
	]);

	useEffect(() => {
		if (
			hoveredOutlineKey !== null &&
			!outlineTargets.some((target) => target.key === hoveredOutlineKey)
		) {
			setHoveredOutlineKey(null);
		}
	}, [hoveredOutlineKey, outlineTargets]);

	const targetsByKey = useMemo(() => {
		return new Map(outlineTargets.map((target) => [target.key, target]));
	}, [outlineTargets]);
	const outlinesForRendering = useMemo(() => {
		return orderOutlinesForRendering({outlines, sequences, targetsByKey});
	}, [outlines, sequences, targetsByKey]);
	const outlinesByKey = useMemo(() => {
		return new Map(outlines.map((outline) => [outline.key, outline]));
	}, [outlines]);
	const allDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			(target.selected || target.containsSelection) && target.drag !== null
				? [target.drag]
				: [],
		);
	}, [outlineTargets]);
	const allDragOutlines = useMemo(() => {
		return outlineTargets.flatMap((target) => {
			if (
				(!target.selected && !target.containsSelection) ||
				target.drag === null
			) {
				return [];
			}

			const outline = outlinesByKey.get(target.key);
			return outline === undefined ? [] : [outline];
		});
	}, [outlineTargets, outlinesByKey]);
	const allScaleDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.scaleDrag !== null ? [target.scaleDrag] : [],
		);
	}, [outlineTargets]);
	const allRotationDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.rotationDrag !== null
				? [target.rotationDrag]
				: [],
		);
	}, [outlineTargets]);
	const guidesForSnap = useMemo(() => {
		if (!editorShowGuides || canvasContent?.type !== 'composition') {
			return [];
		}

		return guidesList.filter(
			(guide) => guide.compositionId === canvasContent.compositionId,
		);
	}, [canvasContent, editorShowGuides, guidesList]);
	const snapTargets = useMemo(() => {
		return getSelectedOutlineSnapTargets({
			compositionHeight,
			compositionWidth,
			guides: guidesForSnap,
		});
	}, [compositionHeight, compositionWidth, guidesForSnap]);

	const saveKeyboardNudgeSession = useCallback(() => {
		const session = keyboardNudgeSessionRef.current;
		if (session === null) {
			return;
		}

		keyboardNudgeSessionRef.current = null;
		const changes = getSelectedOutlineDragChanges({
			dragStates: session.dragStates,
			lastValues: session.lastValues,
		});

		if (changes.length === 0) {
			clearSelectedOutlineDragOverrides({
				clearDragOverrides,
				dragStates: session.dragStates,
			});
			return;
		}

		const staticChanges = changes.filter(
			(change): change is SelectedOutlineStaticDragChange =>
				change.type === 'static',
		);
		const keyframedChanges = changes.filter(
			(change): change is SelectedOutlineKeyframedDragChange =>
				change.type === 'keyframed',
		);

		Promise.all([
			staticChanges.length > 0
				? saveSequenceProps({
						changes: staticChanges,
						setPropStatuses,
						clientId: session.clientId,
						undoLabel:
							changes.length > 1 ? 'Move selected sequences' : 'Move sequence',
						redoLabel:
							changes.length > 1
								? 'Move selected sequences back'
								: 'Move sequence back',
					})
				: Promise.resolve(),
			...keyframedChanges.map((change) =>
				callAddSequenceKeyframe({
					fileName: change.fileName,
					nodePath: change.nodePath,
					fieldKey: change.fieldKey,
					sourceFrame: change.sourceFrame,
					value: change.value,
					schema: change.schema,
					setPropStatuses,
					clientId: change.clientId,
				}),
			),
		])
			.catch((err) => {
				showNotification(
					`Could not save sequence props: ${
						err instanceof Error ? err.message : String(err)
					}`,
					4000,
				);
			})
			.finally(() => {
				clearSelectedOutlineDragOverrides({
					clearDragOverrides,
					dragStates: session.dragStates,
				});
			});
	}, [clearDragOverrides, setPropStatuses]);

	useEffect(() => {
		saveKeyboardNudgeSessionRef.current = saveKeyboardNudgeSession;
	}, [saveKeyboardNudgeSession]);

	useEffect(() => {
		return () => {
			saveKeyboardNudgeSessionRef.current();
		};
	}, []);

	const seekWithArrowKey = useCallback(
		(
			event: KeyboardEvent,
			direction: SelectedOutlineKeyboardNudgeDirection,
		) => {
			if (direction === 'up' || direction === 'down') {
				return;
			}

			event.preventDefault();

			if (direction === 'left') {
				if (event.altKey) {
					seek(0);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: 0,
					});
				} else if (event.shiftKey) {
					frameBack(getCurrentFps());
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - getCurrentFps()),
					});
				} else {
					frameBack(1);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - 1),
					});
				}

				return;
			}

			if (event.altKey) {
				seek(getCurrentDuration() - 1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration() - 1,
					frame: getCurrentDuration() - 1,
				});
			} else if (event.shiftKey) {
				frameForward(getCurrentFps());
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(
						getCurrentDuration() - 1,
						getCurrentFrame() + getCurrentFps(),
					),
				});
			} else {
				frameForward(1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(getCurrentDuration() - 1, getCurrentFrame() + 1),
				});
			}
		},
		[frameBack, frameForward, getCurrentFrame, seek],
	);

	const onArrowKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

			if (direction === null) {
				return;
			}

			if (selectedItems.length === 0 || allDragTargets.length === 0) {
				seekWithArrowKey(event, direction);
				return;
			}

			if (event.altKey) {
				seekWithArrowKey(event, direction);
				return;
			}

			event.preventDefault();

			const activeSession =
				keyboardNudgeSessionRef.current ??
				((): SelectedOutlineKeyboardNudgeSession => {
					const [firstDragTarget] = allDragTargets;
					if (firstDragTarget === undefined) {
						throw new Error('Expected a drag target');
					}

					return {
						clientId: firstDragTarget.clientId,
						deltaX: 0,
						deltaY: 0,
						dragStates: getSelectedOutlineDragStates({
							dragTargets: allDragTargets,
							getDragOverrides,
							timelinePosition,
						}),
						lastValues: new Map(),
					};
				})();

			keyboardNudgeSessionRef.current = activeSession;
			const nextDeltas = getSelectedOutlineKeyboardNudgeDeltas({
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
				direction,
				shiftKey: event.shiftKey,
			});
			activeSession.deltaX = nextDeltas.deltaX;
			activeSession.deltaY = nextDeltas.deltaY;

			const lastValues = getSelectedOutlineDragValues({
				dragStates: activeSession.dragStates,
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
			});
			activeSession.lastValues = lastValues;

			for (const dragState of activeSession.dragStates) {
				const value = lastValues.get(dragState.key);
				if (value === undefined) {
					throw new Error('Expected drag value to be available');
				}

				if (dragState.target.propStatus.status === 'keyframed') {
					setDragOverrides(
						dragState.target.nodePath,
						translateFieldKey,
						Internals.makeKeyframedDragOverride({
							status: dragState.target.propStatus,
							frame: dragState.sourceFrame,
							value,
						}),
					);
				} else {
					setDragOverrides(
						dragState.target.nodePath,
						translateFieldKey,
						Internals.makeStaticDragOverride(value),
					);
				}
			}
		},
		[
			allDragTargets,
			getDragOverrides,
			seekWithArrowKey,
			selectedItems.length,
			setDragOverrides,
			timelinePosition,
		],
	);

	const onArrowKeyUp = useCallback(
		(event: KeyboardEvent) => {
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

			if (direction === null || keyboardNudgeSessionRef.current === null) {
				return;
			}

			event.preventDefault();
			saveKeyboardNudgeSession();
		},
		[saveKeyboardNudgeSession],
	);

	useEffect(() => {
		const keyDownBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				key,
				callback: onArrowKeyDown,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		const keyUpBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keyup',
				key,
				callback: onArrowKeyUp,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);

		return () => {
			for (const binding of [...keyDownBindings, ...keyUpBindings]) {
				binding.unregister();
			}
		};
	}, [keybindings, onArrowKeyDown, onArrowKeyUp, saveKeyboardNudgeSession]);

	const updateOutlines = useCallback(() => {
		if (overlayRef.current === null || outlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		const nextOutlines = measureOutlines(overlayRef.current, outlineTargets);
		setOutlines((prevOutlines) =>
			outlinesAreEqual(prevOutlines, nextOutlines)
				? prevOutlines
				: nextOutlines,
		);
	}, [outlineTargets]);

	useLayoutEffect(() => {
		updateOutlines();
	}, [outlineTargets, scale, translationX, translationY, updateOutlines]);

	useLayoutEffect(() => {
		if (outlineTargets.length === 0 || typeof ResizeObserver === 'undefined') {
			return;
		}

		let animationFrame: number | null = null;

		const scheduleUpdate = () => {
			if (animationFrame !== null) {
				return;
			}

			animationFrame = requestAnimationFrame(() => {
				animationFrame = null;
				updateOutlines();
			});
		};

		const resizeObserver = new ResizeObserver(scheduleUpdate);
		if (overlayRef.current !== null) {
			resizeObserver.observe(overlayRef.current);
		}

		for (const target of outlineTargets) {
			if (target.ref.current !== null) {
				resizeObserver.observe(target.ref.current);
			}
		}

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			resizeObserver.disconnect();
		};
	}, [outlineTargets, updateOutlines]);

	if (outlineTargets.length === 0) {
		return null;
	}

	return (
		<svg
			ref={overlayRef}
			style={outlineContainer}
			width="100%"
			height="100%"
			aria-hidden="true"
		>
			<SelectedOutlineSnapIndicators
				activeSnapPoints={activeSnapPoints}
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				scale={scale}
			/>
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					allDragTargets={allDragTargets}
					allDragOutlines={allDragOutlines}
					allRotationDragTargets={allRotationDragTargets}
					allScaleDragTargets={allScaleDragTargets}
					dragging={draggingOutline}
					hovered={hoveredOutlineKey === outline.key}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onHoverChange={setHoveredOutlineKey}
					onSnapPointsChange={onSnapPointsChange}
					onSelect={selectOutlineItem}
					scale={scale}
					snapTargets={snapTargets}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep transform-origin handles above every transparent outline polygon so SVG hit-testing reaches the selected knob first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineTransformOriginHandle
					key={`${outline.key}-transform-origin`}
					outline={outline}
					onDraggingChange={onDraggingChange}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{outlinesForRendering.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={selectOutlineItem}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};
