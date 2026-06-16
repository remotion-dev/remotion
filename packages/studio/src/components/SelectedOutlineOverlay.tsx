import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {useKeybinding} from '../helpers/use-keybinding';
import {EditorShowOutlinesContext} from '../state/editor-outlines';
import {ScaleLockContext} from '../state/scale-lock';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineKeyboardNudgeDirection,
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
	rotateFieldKey,
	scaleFieldKey,
	transformOriginFieldKey,
	translateFieldKey,
	type SelectedOutlineKeyboardNudgeSession,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {getSelectedUvHandles} from './selected-outline-uv';
import {SelectedOutlineElement} from './SelectedOutlineElement';
import {
	SelectedOutlineUvHandleCircleLayer,
	SelectedOutlineUvHandleConnectionLayer,
} from './SelectedOutlineUvControls';
import {callAddSequenceKeyframe} from './Timeline/call-add-keyframe';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {useTimelineSelection} from './Timeline/TimelineSelection';

export {
	applySelectedOutlineDragAxisLock,
	applySelectedOutlineTransformOriginAxisLock,
	compensateTranslateForTransformOrigin,
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
	selectedOutlineUvSnapThresholdPx,
	selectedOutlineTransformOriginSnapThresholdPx,
	snapSelectedOutlineUv,
	snapSelectedOutlineTransformOriginUv,
} from './selected-outline-drag';
export {
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

export const SelectedOutlineOverlay: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const {selectedItems, selectItem} = useTimelineSelection();
	const {sequences} = useContext(Internals.SequenceManager);
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
	const {frameBack, frameForward, getCurrentFrame, seek} =
		PlayerInternals.usePlayer();
	const keybindings = useKeybinding();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const [outlines, setOutlines] = useState<readonly SelectedOutline[]>([]);
	const [hoveredOutlineKey, setHoveredOutlineKey] = useState<string | null>(
		null,
	);
	const [draggingOutline, setDraggingOutline] = useState(false);
	const overlayRef = useRef<SVGSVGElement>(null);
	const keyboardNudgeSessionRef =
		useRef<SelectedOutlineKeyboardNudgeSession | null>(null);
	const saveKeyboardNudgeSessionRef = useRef<() => void>(() => undefined);

	const onDraggingChange = React.useCallback((dragging: boolean) => {
		setDraggingOutline(dragging);
		if (dragging) {
			setHoveredOutlineKey(null);
		}
	}, []);

	const outlineTargets = useMemo((): SelectedOutlineTarget[] => {
		if (!editorShowOutlines) {
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
			const fieldSchema = controls?.schema[translateFieldKey];
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const propStatus = nodePropStatuses?.[translateFieldKey];
			const scaleFieldSchema = controls?.schema[scaleFieldKey];
			const scalePropStatus = nodePropStatuses?.[scaleFieldKey];
			const rotationFieldSchema = controls?.schema[rotateFieldKey];
			const rotationPropStatus = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			)?.[rotateFieldKey];
			const transformOriginFieldSchema =
				controls?.schema[transformOriginFieldKey];
			const transformOriginPropStatus =
				nodePropStatuses?.[transformOriginFieldKey];
			const rotationSourceFrame = timelinePosition - keyframeDisplayOffset;
			const transformOriginValueForRotation =
				transformOriginFieldSchema?.type === 'transform-origin' &&
				(transformOriginPropStatus?.status === 'static' ||
					transformOriginPropStatus?.status === 'keyframed')
					? String(
							Internals.getEffectiveVisualModeValue({
								propStatus: transformOriginPropStatus,
								dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
									transformOriginFieldKey
								],
								defaultValue: transformOriginFieldSchema.default,
								frame: rotationSourceFrame,
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
					? timelinePosition - keyframeDisplayOffset
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
									const dragOverrideValue = (getDragOverrides(nodePath) ?? {})[
										scaleFieldKey
									];
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
									dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
										transformOriginFieldKey
									],
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
											dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
												rotateFieldKey
											],
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
												dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
													scaleFieldKey
												],
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
									dragOverrideValue: (getDragOverrides(nodePath) ?? {})[
										translateFieldKey
									],
									defaultValue: fieldSchema.default,
									frame: transformOriginSourceFrame,
									shouldResortToDefaultValueIfUndefined: true,
								}) ?? fieldSchema.default,
							),
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
	const allDragTargets = useMemo(() => {
		return outlineTargets.flatMap((target) =>
			target.selected && target.drag !== null ? [target.drag] : [],
		);
	}, [outlineTargets]);
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

	useEffect(() => {
		if (outlineTargets.length === 0) {
			setOutlines((prevOutlines) =>
				prevOutlines.length === 0 ? prevOutlines : [],
			);
			return;
		}

		let animationFrame: number | null = null;

		const updateOutlines = () => {
			if (overlayRef.current) {
				const nextOutlines = measureOutlines(
					overlayRef.current,
					outlineTargets,
				);
				setOutlines((prevOutlines) =>
					outlinesAreEqual(prevOutlines, nextOutlines)
						? prevOutlines
						: nextOutlines,
				);
			}

			animationFrame = requestAnimationFrame(updateOutlines);
		};

		updateOutlines();

		return () => {
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [outlineTargets]);

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
			{outlines.map((outline) => (
				<SelectedOutlineElement
					key={outline.key}
					allDragTargets={allDragTargets}
					allRotationDragTargets={allRotationDragTargets}
					allScaleDragTargets={allScaleDragTargets}
					dragging={draggingOutline}
					hovered={hoveredOutlineKey === outline.key}
					outline={outline}
					onDraggingChange={onDraggingChange}
					onHoverChange={setHoveredOutlineKey}
					onSelect={selectItem}
					scale={scale}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{/* Keep UV controls above every transparent outline polygon so SVG hit-testing reaches the handles first. */}
			{outlines.map((outline) => (
				<SelectedOutlineUvHandleConnectionLayer
					key={`${outline.key}-uv-connection-lines`}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
			{outlines.map((outline) => (
				<SelectedOutlineUvHandleCircleLayer
					key={`${outline.key}-uv-handles`}
					onDraggingChange={onDraggingChange}
					onSelect={selectItem}
					outline={outline}
					target={targetsByKey.get(outline.key)}
				/>
			))}
		</svg>
	);
};
