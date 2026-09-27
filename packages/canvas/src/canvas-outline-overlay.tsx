import {PlayerInternals} from '@remotion/player';
import type {RefObject} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, type GetDragOverrides, type TSequence} from 'remotion';
import type {CanvasController} from './canvas-controller';
import {CanvasOutlinePolygon} from './canvas-outline-polygon';
import {CanvasOutlineSnapLines} from './canvas-outline-snap-lines';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {useCanvasHover, useCanvasSequenceHover} from './hover';
import {getKeyframeDisplayOffset} from './keyframe-frames';
import type {CanvasOutline} from './outline-geometry';
import {handleCanvasOutlinePointerDown} from './outline-interaction';
import {
	getCanvasOutlineSnapTargets,
	type CanvasOutlineSnapPoint,
} from './outline-snap';
import {
	getCanvasActiveOutlineTargets,
	getCanvasOutlineActivity,
	getCanvasOutlineLayoutTargets,
	getCanvasSelectableOutlines,
	getCanvasSelectedSequenceKeys,
	getCanvasSequenceKeysContainingSelection,
	getCanvasVisibleOutlineTargets,
	type CanvasOutlineLayoutTarget,
	type CanvasSelectableOutline,
} from './outline-targets';
import {
	applyCanvasOutlineTranslateDelta,
	canvasTranslateFieldKey,
	clearCanvasOutlineDragOverrides,
	createCanvasOutlineTranslateSession,
	getCanvasOutlineNudgeDeltas,
	getCanvasOutlineNudgeDirection,
	getCanvasOutlineTranslateDragChanges,
	getCanvasOutlineTranslateDragStates,
	startCanvasOutlineTranslateDrag,
	type CanvasOutlineDragChange,
	type CanvasOutlineTranslateSession,
	type CanvasOutlineTranslateTarget,
} from './outline-translate-drag';
import {
	getCanvasSequenceSelectionKey,
	useCanvasSelection,
	type CanvasSelectionItem,
} from './selection';
import type {CanvasSequenceNodePathResolver} from './sequence-node-path';
import type {
	CanvasSequencePropChange,
	CanvasSequencePropsChangeHandler,
	CanvasSequencePropStatusResolver,
} from './sequence-props-change';
import {timelineSequenceNodePathToKey} from './timeline-sequence-node-path-to-key';
import {useCanvasOutlines} from './use-canvas-outlines';
import {useCanvasRuntimeValueSnapshots} from './use-runtime-value-snapshots';
import {useSyncExternalStore} from './use-sync-external-store';

const OUTLINE_COLOR = '#0b84f3';
const SNAP_COLOR = '#ff00ff';

const overlayStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	overflow: 'hidden',
	touchAction: 'none',
	outline: 'none',
};

type OverlayTranslateTarget = CanvasOutlineTranslateTarget & {
	readonly nodePathInfo: SequenceNodePathInfo;
};

const getOverlayTranslateTarget = ({
	selectableOutline,
	getDragOverrides,
	getPropStatuses,
	frame,
}: {
	readonly selectableOutline: CanvasSelectableOutline;
	readonly getDragOverrides: GetDragOverrides;
	readonly getPropStatuses: CanvasSequencePropStatusResolver | null;
	readonly frame: number;
}): OverlayTranslateTarget | null => {
	const {registeredNodePathInfo, sequence} = selectableOutline;
	const {controls} = sequence;
	if (controls === null || registeredNodePathInfo === null) {
		return null;
	}

	// The host knows the source: a computed value cannot be moved and a
	// keyframed one is moved by inserting a keyframe.
	const propStatuses =
		getPropStatuses?.(registeredNodePathInfo, [canvasTranslateFieldKey]) ??
		null;
	const propStatus = propStatuses?.[canvasTranslateFieldKey] ?? null;
	if (
		propStatus !== null &&
		propStatus.status !== 'static' &&
		(propStatus.status !== 'keyframed' ||
			propStatus.interpolationFunction !== 'interpolate')
	) {
		return null;
	}

	const nodePath = registeredNodePathInfo.sequenceSubscriptionKey;
	const runtimeValues = controls.runtimeValues.getSnapshot();
	// Overrides can switch enum variants, which decides whether translate is active.
	const {merged} = Internals.computeEffectiveSchemaValuesDotNotation({
		schema: controls.schema,
		currentValue: runtimeValues,
		overrideValues: getDragOverrides(nodePath),
		propStatus: propStatuses ?? undefined,
		frame:
			(frame - selectableOutline.keyframeDisplayOffset) *
			selectableOutline.keyframePlaybackRate,
	});
	const field = Internals.flattenActiveSchema(
		controls.schema,
		(key) => merged[key],
	)[canvasTranslateFieldKey];
	if (field?.type !== 'translate') {
		return null;
	}

	return {
		nodePath,
		nodePathInfo: registeredNodePathInfo,
		schema: controls.schema,
		fieldDefault: field.default,
		propStatus,
		runtimeValue: runtimeValues[canvasTranslateFieldKey],
		keyframeDisplayOffset: getKeyframeDisplayOffset({
			propStatus,
			keyframeDisplayOffset: selectableOutline.keyframeDisplayOffset,
			keyframePlaybackRate: selectableOutline.keyframePlaybackRate,
		}),
		keyframePlaybackRate: selectableOutline.keyframePlaybackRate,
	};
};

const toSequencePropChanges = (
	changes: readonly CanvasOutlineDragChange[],
	session: CanvasOutlineTranslateSession<OverlayTranslateTarget>,
): CanvasSequencePropChange[] => {
	const targetsByKey = new Map(
		session.dragStates.map((dragState) => [dragState.key, dragState.target]),
	);
	return changes.flatMap((change): CanvasSequencePropChange[] => {
		const target = targetsByKey.get(
			Internals.makeSequencePropsSubscriptionKey(change.nodePath),
		);
		if (target === undefined) {
			return [];
		}

		const base = {
			nodePathInfo: target.nodePathInfo,
			key: change.fieldKey,
			value: change.value,
			schema: change.schema,
		};
		return [
			change.type === 'keyframed'
				? {...base, type: 'keyframe', frame: change.sourceFrame}
				: {...base, type: 'static', defaultValue: target.fieldDefault ?? null},
		];
	});
};

type MeasuredOutlines = {
	readonly targets: readonly CanvasOutlineLayoutTarget[];
	readonly outlinesByKey: ReadonlyMap<string, CanvasOutline>;
};

// Shared by every outline of the overlay; stable so outlines only re-render
// for their own geometry and state.
type OverlayEditing = {
	readonly enabled: boolean;
	readonly getScale: () => number;
	readonly getCurrentFrame: () => number;
	readonly getDragOverrides: GetDragOverrides;
	readonly setDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['setDragOverrides'];
	readonly clearDragOverrides: React.ContextType<
		typeof Internals.VisualModeSettersContext
	>['clearDragOverrides'];
	readonly getTranslateTarget: (
		selectableOutline: CanvasSelectableOutline,
	) => OverlayTranslateTarget | null;
	/** The selected sources, including instances outside the current frame. */
	readonly getSelectedTranslateTargets: () => OverlayTranslateTarget[];
	readonly getSelectedOutlines: () => readonly CanvasOutline[];
	readonly getSnapTargets: () => ReturnType<typeof getCanvasOutlineSnapTargets>;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSnapPointsChange: (
		snapPoints: readonly CanvasOutlineSnapPoint[],
	) => void;
	readonly commitChanges: (
		changes: readonly CanvasOutlineDragChange[],
		session: CanvasOutlineTranslateSession<OverlayTranslateTarget>,
	) => void;
};

const CanvasOutlineElement = React.memo(
	({
		controller,
		containerRef,
		outline,
		target,
		selectableItems,
		dragging,
		editing,
	}: {
		readonly controller: CanvasController;
		readonly containerRef: RefObject<SVGSVGElement | null>;
		readonly outline: CanvasOutline;
		readonly target: CanvasOutlineLayoutTarget;
		readonly selectableItems: readonly CanvasSelectionItem[];
		readonly dragging: boolean;
		readonly editing: OverlayEditing;
	}) => {
		const {hovered, onPointerEnter, onPointerLeave} = useCanvasSequenceHover(
			controller.hover,
			target.nodePathInfo,
			'canvas',
		);
		const onHoverChange = useCallback(
			(key: string | null) => {
				if (key === null) {
					onPointerLeave();
				} else {
					onPointerEnter();
				}
			},
			[onPointerEnter, onPointerLeave],
		);
		const onPointerDown = useCallback(
			(event: React.PointerEvent<SVGPolygonElement>) => {
				const decision = handleCanvasOutlinePointerDown({
					event,
					polygon: event.currentTarget,
					hasTarget: true,
					selected: target.selected,
					containsSelection: target.containsSelection,
					translateWithCommandKey: false,
					isMac: false,
				});
				if (decision === null) {
					return;
				}

				containerRef.current?.focus({preventScroll: true});
				const {
					interaction,
					shouldUpdateSelection,
					deferSelection,
					dragExistingSelection,
				} = decision;
				const select = () =>
					controller.selection.select(
						target.selection,
						interaction,
						selectableItems,
					);
				// Clicking inside the selected group moves it; the clicked
				// outline is selected on release if the pointer did not move.
				if (!deferSelection && shouldUpdateSelection) {
					select();
				}

				if (interaction.shiftKey || interaction.toggleKey) {
					return;
				}

				const dragTargets = !editing.enabled
					? []
					: dragExistingSelection
						? editing.getSelectedTranslateTargets()
						: [editing.getTranslateTarget(target)].filter(
								(dragTarget) => dragTarget !== null,
							);
				if (dragTargets.length === 0) {
					if (deferSelection) {
						select();
					}

					return;
				}

				const dragStates = getCanvasOutlineTranslateDragStates({
					dragTargets,
					getDragOverrides: editing.getDragOverrides,
					timelinePosition: editing.getCurrentFrame(),
				});
				startCanvasOutlineTranslateDrag({
					event,
					captureTarget: event.currentTarget,
					dragStates,
					scale: editing.getScale(),
					snapping: {
						outlines: dragExistingSelection
							? editing.getSelectedOutlines()
							: [outline],
						getTargets: editing.getSnapTargets,
						onSnapPointsChange: editing.onSnapPointsChange,
						modifierDisablesSnapping: true,
					},
					setDragOverrides: editing.setDragOverrides,
					clearDragOverrides: editing.clearDragOverrides,
					onDragStart: () => {
						editing.onDraggingChange(true);
						controller.hover.clear('canvas');
					},
					onDragEnd: ({changes, dragged, released, session}) => {
						if (dragged) {
							editing.onDraggingChange(false);
						}

						if (changes.length === 0) {
							if (deferSelection && !dragged && released) {
								select();
							}

							return;
						}

						editing.commitChanges(changes, session);
					},
				});
			},
			[
				containerRef,
				controller.hover,
				controller.selection,
				editing,
				outline,
				selectableItems,
				target,
			],
		);
		return (
			<CanvasOutlinePolygon
				outline={outline}
				directlySelected={target.selected}
				data-selected={target.selected}
				dragging={dragging}
				visible={target.showSelectedOutline || hovered}
				interactive
				stroke={OUTLINE_COLOR}
				fill="transparent"
				onHoverChange={onHoverChange}
				onPointerDown={onPointerDown}
			/>
		);
	},
);

// Only this leaf subscribes to the frame. An idle, unselected Canvas does not
// measure its composition or render its layer list on every playback frame.
const ActiveCanvasOutlines = React.memo(
	({
		controller,
		containerRef,
		selectableOutlines,
		sequences,
		selectableItems,
		measureAll,
		dragging,
		editing,
		measuredRef,
	}: {
		readonly controller: CanvasController;
		readonly containerRef: RefObject<SVGSVGElement | null>;
		readonly selectableOutlines: readonly CanvasSelectableOutline[];
		readonly sequences: readonly TSequence[];
		readonly selectableItems: readonly CanvasSelectionItem[];
		readonly measureAll: boolean;
		readonly dragging: boolean;
		readonly editing: OverlayEditing;
		readonly measuredRef: React.MutableRefObject<MeasuredOutlines>;
	}) => {
		const frame = Internals.Timeline.useTimelinePosition();
		const {selectedItems} = useCanvasSelection(controller.selection);
		const hover = useCanvasHover(controller.hover);
		const {getDragOverrides} = useContext(
			Internals.VisualModeDragOverridesContext,
		);
		const selectedSequenceKeys = useMemo(
			() => getCanvasSelectedSequenceKeys(selectedItems),
			[selectedItems],
		);
		const sequenceKeysContainingSelection = useMemo(
			() => getCanvasSequenceKeysContainingSelection(selectedItems),
			[selectedItems],
		);
		const hoveredTimelineNodePathKey =
			hover?.source === 'timeline' ? hover.nodePathKey : null;
		const activeLayers = useMemo(
			() =>
				getCanvasActiveOutlineTargets({
					targets: selectableOutlines,
					selectedSequenceKeys,
					sequenceKeysContainingSelection,
					hoveredNodePathKey: hoveredTimelineNodePathKey,
					measureAll,
				}),
			[
				hoveredTimelineNodePathKey,
				measureAll,
				selectableOutlines,
				selectedSequenceKeys,
				sequenceKeysContainingSelection,
			],
		);
		// Subscribe before filtering by the playback frame to avoid resubscribing
		// every frame when sequences enter or leave the composition.
		const runtimeControls = useMemo(
			() =>
				activeLayers.flatMap(({sequence}) =>
					sequence.controls ? [sequence.controls] : [],
				),
			[activeLayers],
		);
		const runtimeSnapshots = useCanvasRuntimeValueSnapshots(runtimeControls);
		const valuesByStore = useMemo(
			() =>
				new Map(
					runtimeControls.map((controls, index) => [
						controls.runtimeValues,
						runtimeSnapshots[index],
					]),
				),
			[runtimeControls, runtimeSnapshots],
		);
		// Overrides move and crop the elements; deriving the targets from them
		// re-measures the outlines after each preview.
		const targets = useMemo(
			() =>
				getCanvasOutlineLayoutTargets({
					selectableOutlines: getCanvasVisibleOutlineTargets({
						targets: activeLayers,
						timelinePosition: frame,
					}),
					selectedSequenceKeys,
					sequenceKeysContainingSelection,
					targetKey: null,
				}).map((target) => {
					const values = target.sequence.controls
						? (valuesByStore.get(target.sequence.controls.runtimeValues) ?? {})
						: {};
					const overrides =
						target.registeredNodePathInfo === null
							? {}
							: getDragOverrides(
									target.registeredNodePathInfo.sequenceSubscriptionKey,
								);
					const cropValue = (key: string) => {
						const override = Internals.resolveDragOverrideValue({
							dragOverrideValue: overrides[key],
							frame:
								(frame - target.keyframeDisplayOffset) *
								target.keyframePlaybackRate,
						});
						const value =
							override.type === 'resolved' ? override.value : values[key];
						return typeof value === 'number' && Number.isFinite(value)
							? value
							: 0;
					};

					return {
						...target,
						crop: Internals.resolveSequenceCrop({
							cropLeft: cropValue('cropLeft'),
							cropRight: cropValue('cropRight'),
							cropTop: cropValue('cropTop'),
							cropBottom: cropValue('cropBottom'),
						}),
					};
				}),
			[
				activeLayers,
				frame,
				getDragOverrides,
				selectedSequenceKeys,
				sequenceKeysContainingSelection,
				valuesByStore,
			],
		);
		const {outlinesForRendering, outlinesByKey, targetsByKey} =
			useCanvasOutlines({
				containerRef,
				targets,
				sequences,
				hoverController: controller.hover,
				freezeOrder: dragging,
				updateOutlinesRef: null,
			});
		useLayoutEffect(() => {
			measuredRef.current = {targets, outlinesByKey};
		}, [measuredRef, outlinesByKey, targets]);
		return (
			<>
				{outlinesForRendering.map((outline) => {
					const target = targetsByKey.get(outline.key);
					return target ? (
						<CanvasOutlineElement
							key={outline.key}
							controller={controller}
							containerRef={containerRef}
							outline={outline}
							target={target}
							selectableItems={selectableItems}
							dragging={dragging}
							editing={editing}
						/>
					) : null;
				})}
			</>
		);
	},
);

export const CanvasOutlineOverlay = React.memo(
	({
		controller,
		resolveSequenceNodePathInfo,
		onSequencePropsChange,
		getSequencePropStatuses,
	}: {
		readonly controller: CanvasController;
		readonly resolveSequenceNodePathInfo: CanvasSequenceNodePathResolver;
		readonly onSequencePropsChange: CanvasSequencePropsChangeHandler | null;
		readonly getSequencePropStatuses: CanvasSequencePropStatusResolver | null;
	}) => {
		const containerRef = useRef<SVGSVGElement | null>(null);
		const [container, setContainer] = useState<SVGSVGElement | null>(null);
		const attachContainer = useCallback((element: SVGSVGElement | null) => {
			containerRef.current = element;
			setContainer(element);
		}, []);
		const [hovered, setHovered] = useState(false);
		// The scale is captured when a drag starts; the snap lines are drawn
		// in composition pixels and stay aligned for the whole gesture.
		const [dragScale, setDragScale] = useState<number | null>(null);
		const dragging = dragScale !== null;
		const [snapPoints, setSnapPoints] = useState<
			readonly CanvasOutlineSnapPoint[]
		>([]);
		const tracks = useSyncExternalStore(
			controller.timeline.subscribe,
			controller.timeline.getSnapshot,
			controller.timeline.getSnapshot,
		);
		const selection = useCanvasSelection(controller.selection);
		const hover = useCanvasHover(controller.hover);
		const videoConfig = Internals.useUnsafeVideoConfig();
		const compositionWidth = videoConfig?.width ?? 1;
		const compositionHeight = videoConfig?.height ?? 1;
		const {getCurrentFrame} = PlayerInternals.usePlayerMethods();
		const {getDragOverrides} = useContext(
			Internals.VisualModeDragOverridesContext,
		);
		const {setDragOverrides, clearDragOverrides} = useContext(
			Internals.VisualModeSettersContext,
		);
		const sequences = useMemo(
			() => tracks.map(({sequence}) => sequence),
			[tracks],
		);
		const resolvedTracks = useMemo(
			() =>
				tracks.map((track, index) => ({
					...track,
					nodePathInfo: resolveSequenceNodePathInfo(track, index),
				})),
			[resolveSequenceNodePathInfo, tracks],
		);
		const selectableOutlines = useMemo(
			() =>
				getCanvasSelectableOutlines({
					tracks: resolvedTracks,
					timelinePosition: null,
					resolveSequenceNodePathInfo: null,
				}),
			[resolvedTracks],
		);
		const selectableItems = useMemo(
			() =>
				resolvedTracks.flatMap(({nodePathInfo}): CanvasSelectionItem[] =>
					nodePathInfo === null || nodePathInfo.auxiliaryKeys.length !== 0
						? []
						: [{type: 'sequence', nodePathInfo}],
				),
			[resolvedTracks],
		);
		useEffect(() => {
			controller.hover.setHoveredSequence((current) => {
				if (current === null) {
					return current;
				}

				return selectableItems.some(
					(item) =>
						item.type !== 'guide' &&
						(current.source === 'timeline'
							? timelineSequenceNodePathToKey(
									item.nodePathInfo.sequenceSubscriptionKey,
								) === current.nodePathKey
							: getCanvasSequenceSelectionKey(item.nodePathInfo) ===
								current.key),
				)
					? current
					: null;
			});
		}, [controller.hover, selectableItems]);
		useEffect(() => {
			const ownerWindow = containerRef.current?.ownerDocument.defaultView;
			const clearHover = () => {
				setHovered(false);
				controller.hover.clear(null);
			};

			ownerWindow?.addEventListener('blur', clearHover);

			return () => {
				ownerWindow?.removeEventListener('blur', clearHover);
				controller.hover.clear('canvas');
			};
		}, [controller.hover]);

		// Gestures read the latest state through refs so the outline elements
		// keep a stable editing object.
		const latestRef = useRef({
			selectableOutlines,
			onSequencePropsChange,
			getSequencePropStatuses,
			compositionWidth,
			compositionHeight,
			getDragOverrides,
		});
		useLayoutEffect(() => {
			latestRef.current = {
				selectableOutlines,
				onSequencePropsChange,
				getSequencePropStatuses,
				compositionWidth,
				compositionHeight,
				getDragOverrides,
			};
		}, [
			compositionHeight,
			compositionWidth,
			getDragOverrides,
			getSequencePropStatuses,
			onSequencePropsChange,
			selectableOutlines,
		]);
		const measuredRef = useRef<MeasuredOutlines>({
			targets: [],
			outlinesByKey: new Map(),
		});
		const editingEnabled = onSequencePropsChange !== null;
		const editing = useMemo((): OverlayEditing => {
			const getLatestDragOverrides: GetDragOverrides = (nodePath) =>
				latestRef.current.getDragOverrides(nodePath);
			const getTranslateTarget = (selectableOutline: CanvasSelectableOutline) =>
				getOverlayTranslateTarget({
					selectableOutline,
					getDragOverrides: getLatestDragOverrides,
					getPropStatuses: latestRef.current.getSequencePropStatuses,
					frame: getCurrentFrame(),
				});
			const getScale = () => {
				const width = containerRef.current?.getBoundingClientRect().width;
				return width ? width / latestRef.current.compositionWidth : 1;
			};

			return {
				enabled: editingEnabled,
				getScale,
				getCurrentFrame,
				getDragOverrides: getLatestDragOverrides,
				setDragOverrides,
				clearDragOverrides,
				getTranslateTarget,
				getSelectedTranslateTargets: () => {
					const selectedKeys = getCanvasSequenceKeysContainingSelection(
						controller.selection.getSnapshot().selectedItems,
					);
					// Instances of one source node share a value; move it once.
					const targetsBySource = new Map<string, OverlayTranslateTarget>();
					for (const selectableOutline of latestRef.current
						.selectableOutlines) {
						if (!selectedKeys.has(selectableOutline.key)) {
							continue;
						}

						const dragTarget = getTranslateTarget(selectableOutline);
						if (dragTarget === null) {
							continue;
						}

						const sourceKey = Internals.makeSequencePropsSubscriptionKey(
							dragTarget.nodePath,
						);
						if (!targetsBySource.has(sourceKey)) {
							targetsBySource.set(sourceKey, dragTarget);
						}
					}

					return [...targetsBySource.values()];
				},
				getSelectedOutlines: () => {
					const {targets, outlinesByKey} = measuredRef.current;
					return targets.flatMap((target) => {
						if (
							(!target.selected && !target.containsSelection) ||
							getTranslateTarget(target) === null
						) {
							return [];
						}

						const outline = outlinesByKey.get(target.key);
						return outline === undefined ? [] : [outline];
					});
				},
				getSnapTargets: () =>
					getCanvasOutlineSnapTargets({
						compositionWidth: latestRef.current.compositionWidth,
						compositionHeight: latestRef.current.compositionHeight,
						guides: [],
					}),
				onDraggingChange: (nextDragging) => {
					setDragScale(nextDragging ? getScale() : null);
				},
				onSnapPointsChange: setSnapPoints,
				commitChanges: (changes, session) => {
					const handler = latestRef.current.onSequencePropsChange;
					if (handler === null) {
						clearCanvasOutlineDragOverrides({
							clearDragOverrides,
							dragStates: session.dragStates,
						});
						return;
					}

					handler(toSequencePropChanges(changes, session));
				},
			};
		}, [
			clearDragOverrides,
			controller.selection,
			editingEnabled,
			getCurrentFrame,
			setDragOverrides,
		]);

		// Arrow keys nudge the selection by one pixel, ten with Shift. The
		// values are committed when the key is released.
		const nudgeSessionRef =
			useRef<CanvasOutlineTranslateSession<OverlayTranslateTarget> | null>(
				null,
			);
		const finishNudge = useCallback(() => {
			const session = nudgeSessionRef.current;
			if (session === null) {
				return;
			}

			nudgeSessionRef.current = null;
			const changes = getCanvasOutlineTranslateDragChanges({
				dragStates: session.dragStates,
				lastValues: session.lastValues,
			});
			if (changes.length === 0) {
				clearCanvasOutlineDragOverrides({
					clearDragOverrides,
					dragStates: session.dragStates,
				});
				return;
			}

			editing.commitChanges(changes, session);
		}, [clearDragOverrides, editing]);
		useEffect(() => finishNudge, [finishNudge]);
		const onKeyDown = useCallback(
			(event: React.KeyboardEvent<SVGSVGElement>) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					event.stopPropagation();
					controller.selection.clear();
					return;
				}

				const direction = getCanvasOutlineNudgeDirection(event.key);
				if (
					direction === null ||
					event.altKey ||
					event.metaKey ||
					event.ctrlKey ||
					!editing.enabled
				) {
					return;
				}

				const session =
					nudgeSessionRef.current ??
					(() => {
						const dragTargets = editing.getSelectedTranslateTargets();
						return dragTargets.length === 0
							? null
							: createCanvasOutlineTranslateSession(
									getCanvasOutlineTranslateDragStates({
										dragTargets,
										getDragOverrides: editing.getDragOverrides,
										timelinePosition: editing.getCurrentFrame(),
									}),
								);
					})();
				if (session === null) {
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				nudgeSessionRef.current = session;
				applyCanvasOutlineTranslateDelta({
					session,
					...getCanvasOutlineNudgeDeltas({
						deltaX: session.deltaX,
						deltaY: session.deltaY,
						direction,
						shiftKey: event.shiftKey,
					}),
					setDragOverrides: editing.setDragOverrides,
				});
			},
			[controller.selection, editing],
		);
		const onKeyUp = useCallback(
			(event: React.KeyboardEvent<SVGSVGElement>) => {
				if (
					getCanvasOutlineNudgeDirection(event.key) === null ||
					nudgeSessionRef.current === null
				) {
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				finishNudge();
			},
			[finishNudge],
		);

		const {measurementActive, measureAllOutlines} = getCanvasOutlineActivity({
			canvasHovered: hovered,
			dragging,
			contextMenuOpen: false,
			hasSelection: selection.selectedItems.some(
				(item) => item.type !== 'guide',
			),
			hoveredSequence: hover,
		});
		return (
			<svg
				ref={attachContainer}
				style={overlayStyle}
				width="100%"
				height="100%"
				tabIndex={0}
				role="group"
				aria-label="Canvas selection"
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => {
					setHovered(false);
					controller.hover.clear('canvas');
				}}
				onPointerDown={(event) => {
					if (event.button !== 0) {
						return;
					}

					event.preventDefault();
					event.stopPropagation();
					containerRef.current?.focus({preventScroll: true});
					controller.selection.clear();
				}}
				onDoubleClick={(event) => event.stopPropagation()}
				onKeyDown={onKeyDown}
				onKeyUp={onKeyUp}
				onBlur={finishNudge}
			>
				{measurementActive && container !== null ? (
					<ActiveCanvasOutlines
						controller={controller}
						containerRef={containerRef}
						selectableOutlines={selectableOutlines}
						sequences={sequences}
						selectableItems={selectableItems}
						measureAll={measureAllOutlines}
						dragging={dragging}
						editing={editing}
						measuredRef={measuredRef}
					/>
				) : null}
				{dragScale === null ? null : (
					<CanvasOutlineSnapLines
						compositionHeight={compositionHeight}
						compositionWidth={compositionWidth}
						scale={dragScale}
						snapPoints={snapPoints}
						color={SNAP_COLOR}
					/>
				)}
			</svg>
		);
	},
);
