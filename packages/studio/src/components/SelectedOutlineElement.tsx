import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getConnectedCompositions} from '../helpers/get-connected-compositions';
import {getSequenceDoubleClickAction} from '../helpers/get-sequence-double-click-action';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {
	openInCodingAgent as launchCodingAgent,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {SetSelectedModalContext} from '../state/modals';
import {
	useIsTimelineSequenceHovered,
	useSetTimelineSequenceHover,
} from '../state/timeline-sequence-hover';
import {Transform3DModeStateContext} from '../state/transform-3d-mode';
import {useConfirmationDialog} from './ConfirmationDialog';
import {deleteJsxNode} from './delete-jsx-node-api';
import {useSelectComposition} from './InitialCompositionLoader';
import {showNotification} from './Notifications/NotificationCenter';
import {getSelectedOutlineControlLayout} from './selected-outline-control-layout';
import type {SelectedOutline} from './selected-outline-geometry';
import {type SelectedOutlineSnapPoint} from './selected-outline-snap';
import {
	cropFieldKeys,
	rotateFieldKey,
	type SelectedOutlineDragTarget,
	type SelectedOutlineLayoutTarget,
	type SelectedOutlineRotationDragTarget,
	type SelectedOutlineScaleDragTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineCanvasRotation} from './SelectedOutlineCanvasRotation';
import {SelectedOutlineCropControls} from './SelectedOutlineCropControls';
import {SelectedOutlinePolygon} from './SelectedOutlinePolygon';
import {SelectedOutlineRotationCornerHandle} from './SelectedOutlineRotationCornerHandle';
import {SelectedOutlineScaleEdgeLine} from './SelectedOutlineScaleEdgeLine';
import {disableSequenceInteractivity} from './Timeline/disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './Timeline/duplicate-selected-timeline-item';
import {getSequenceContextMenuItems} from './Timeline/get-sequence-context-menu-items';
import {getTimelineAssetLinkInfo} from './Timeline/timeline-asset-link';
import {
	getTimelineSequenceSelectionKey,
	type TimelineSelection,
	type TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from './use-default-editor-info';
import {useSelectAsset} from './use-select-asset';
type SelectedOutlineElementProps = {
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly dragging: boolean;
	readonly getAllDragOutlines: () => readonly SelectedOutline[];
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
	readonly getAllRotationDragTargets: () => readonly SelectedOutlineRotationDragTarget[];
	readonly getAllScaleDragTargets: () => readonly SelectedOutlineScaleDragTarget[];
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onContextMenuOpenChange: (open: boolean) => void;
	readonly onSnapPointsChange: (
		snapPoints: readonly SelectedOutlineSnapPoint[],
	) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
};

const SelectedOutlineElementUnmemoized: React.FC<
	SelectedOutlineElementProps
> = ({
	compositionHeight,
	compositionWidth,
	dragging,
	getAllDragOutlines,
	getAllDragTargets,
	getAllRotationDragTargets,
	getAllScaleDragTargets,
	getLatestTargetByKey,
	layoutTarget,
	outline,
	onDraggingChange,
	onContextMenuOpenChange,
	onSnapPointsChange,
	onSelect,
	scale,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {
		canConfigureApps,
		canOpenInEditor: editorAvailable,
		defaultEditorId,
		editorInfo,
	} = useEditorOpening(previewServerState.type === 'connected');
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);
	const confirm = useConfirmationDialog();
	const selectAsset = useSelectAsset();
	const selectComposition = useSelectComposition();
	const {compositions} = useContext(Internals.CompositionManager);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setManuallyEnabled} = useContext(Transform3DModeStateContext);
	const setHoveredSequence = useSetTimelineSequenceHover();
	const targetRef = useRef(layoutTarget);
	const controlLayout = useMemo(
		() => getSelectedOutlineControlLayout(outline.points),
		[outline.points],
	);
	useLayoutEffect(() => {
		targetRef.current = layoutTarget;
	}, [layoutTarget]);
	const getTarget = React.useCallback(() => {
		const currentTarget = targetRef.current;
		if (currentTarget === undefined) {
			return undefined;
		}

		return getLatestTargetByKey(currentTarget.key);
	}, [getLatestTargetByKey]);
	const getLayoutTarget = React.useCallback(() => targetRef.current, []);
	const hoveredNodePathKey = useMemo(
		() =>
			layoutTarget === undefined
				? null
				: timelineSequenceNodePathToKey(
						layoutTarget.nodePathInfo.sequenceSubscriptionKey,
					),
		[layoutTarget],
	);
	const hovered = useIsTimelineSequenceHovered(hoveredNodePathKey);
	const controlTarget =
		layoutTarget !== undefined && (layoutTarget.containsSelection || hovered)
			? getLatestTargetByKey(layoutTarget.key)
			: undefined;
	const onHoverChange = React.useCallback(
		(key: string | null) => {
			setHoveredSequence((currentHover) => {
				if (key !== null) {
					const hoverTarget = targetRef.current;
					if (hoverTarget === undefined || hoverTarget.key !== key) {
						return currentHover;
					}

					return {
						key,
						nodePathKey: timelineSequenceNodePathToKey(
							hoverTarget.nodePathInfo.sequenceSubscriptionKey,
						),
						source: 'canvas',
					};
				}

				return currentHover?.source === 'canvas' ? null : currentHover;
			});
		},
		[setHoveredSequence],
	);

	const resolveOriginalLocation = React.useCallback(
		async (resolveTarget: SelectedOutlineTarget) => {
			const stack = resolveTarget.sequence.getStack();
			if (!stack) {
				return null;
			}

			let originalLocation: ResolvedStackLocation | null = null;
			try {
				originalLocation = await getOriginalLocationFromStack(
					stack,
					'sequence',
				);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}

			updateResolvedStackTrace(stack, originalLocation);
			return originalLocation;
		},
		[updateResolvedStackTrace],
	);

	const onDoubleClickTarget = React.useCallback(
		(doubleClickTarget: SelectedOutlineTarget, button: number) => {
			const connectedCompositions = getConnectedCompositions({
				compositions,
				singleChildComponent: doubleClickTarget.sequence.singleChildComponent,
			});
			const action = getSequenceDoubleClickAction({
				button,
				canOpenInEditor: editorAvailable,
				numberOfConnectedCompositions: connectedCompositions.length,
			});

			if (action === null) {
				return false;
			}

			if (action === 'open-connected-composition') {
				selectComposition(connectedCompositions[0], true);
				return true;
			}

			const openTargetInEditor = async () => {
				const originalLocation =
					await resolveOriginalLocation(doubleClickTarget);
				if (originalLocation === null || defaultEditorId === null) {
					return;
				}

				await openOriginalPositionInEditor(originalLocation, defaultEditorId);
			};

			openTargetInEditor().catch((err) => {
				showNotification((err as Error).message, 2000);
			});

			return true;
		},
		[
			compositions,
			defaultEditorId,
			editorAvailable,
			resolveOriginalLocation,
			selectComposition,
		],
	);

	const onContextMenuOpen = React.useCallback(async () => {
		const contextMenuTarget = getTarget();
		if (contextMenuTarget === undefined) {
			return false;
		}

		if (!contextMenuTarget.selected) {
			onSelect(contextMenuTarget.selection, {
				shiftKey: false,
				toggleKey: false,
			});
		}

		const originalLocation = await resolveOriginalLocation(contextMenuTarget);

		const nodePath = contextMenuTarget.nodePathInfo.sequenceSubscriptionKey;
		const mediaSrc =
			contextMenuTarget.sequence.type === 'audio' ||
			contextMenuTarget.sequence.type === 'video' ||
			contextMenuTarget.sequence.type === 'image'
				? contextMenuTarget.sequence.src
				: null;
		const assetLinkInfo = mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null;
		const canOpenInEditor = Boolean(originalLocation && editorAvailable);
		const sourceEditingEnabled = isStudioInteractivityEnabled();
		const disableInteractivityDisabled =
			!sourceEditingEnabled || !contextMenuTarget.sequence.showInTimeline;
		const sourceEditDisabled =
			!sourceEditingEnabled ||
			!contextMenuTarget.sequence.controls ||
			!nodePath.absolutePath;
		const isProgrammaticallyDuplicated =
			contextMenuTarget.nodePathInfo.numberOfSequencesWithThisNodePath > 1;
		const canAddEffect =
			contextMenuTarget.nodePathInfo.supportsEffects &&
			!sourceEditDisabled &&
			previewServerState.type === 'connected';
		const canCrop = contextMenuTarget.canCrop && !sourceEditDisabled;
		const canRotate = !sourceEditDisabled;

		return getSequenceContextMenuItems({
			assetLinkInfo,
			canOpenInEditor,
			codingAgentInfo,
			deleteDisabled: sourceEditDisabled,
			disableInteractivityDisabled,
			duplicateDisabled: sourceEditDisabled || isProgrammaticallyDuplicated,
			editorInfo,
			includeSourceEditItems: sourceEditingEnabled,
			isProgrammaticallyDuplicated,
			onConfigureApps: canConfigureApps
				? () => {
						setSelectedModal({
							type: 'settings',
							initialTab: 'apps',
							initialPublicLicenseKey:
								window.remotion_renderDefaults?.publicLicenseKey ?? null,
						});
					}
				: null,
			onDeleteSequenceFromSource: async () => {
				if (sourceEditDisabled || previewServerState.type !== 'connected') {
					return;
				}

				if (
					contextMenuTarget.nodePathInfo.numberOfSequencesWithThisNodePath > 1
				) {
					const shouldDelete = await confirm({
						title: 'Delete sequence?',
						message:
							'This sequence is programmatically duplicated ' +
							contextMenuTarget.nodePathInfo.numberOfSequencesWithThisNodePath +
							' times in the code. Deleting removes all instances. Continue?',
						confirmLabel: 'Delete',
					});
					if (!shouldDelete) {
						return;
					}
				}

				try {
					const result = await deleteJsxNode({
						nodes: [
							{
								fileName: nodePath.absolutePath,
								nodePath: nodePath.nodePath,
							},
						],
					});
					if (!result.success) {
						showNotification(result.reason, 4000);
					}
				} catch (err) {
					showNotification((err as Error).message, 4000);
				}
			},
			onDisableSequenceInteractivity: () => {
				if (
					disableInteractivityDisabled ||
					previewServerState.type !== 'connected'
				) {
					return;
				}

				disableSequenceInteractivity({
					fileName: nodePath.absolutePath,
					nodePath,
					setPropStatuses,
					clientId: previewServerState.clientId,
				});
			},
			onDuplicateSequenceFromSource: () => {
				if (sourceEditDisabled) {
					return;
				}

				duplicateSequencesFromSource(
					[contextMenuTarget.nodePathInfo],
					confirm,
				).catch(() => undefined);
			},
			openInCodingAgent: (codingAgentId, codingAgentName, contextForAgents) => {
				launchCodingAgent(codingAgentId, contextForAgents)
					.then((response) => {
						if (!response.success) {
							showNotification(`Could not open ${codingAgentName}`, 2000);
						}
					})
					.catch((err) => {
						showNotification((err as Error).message, 2000);
					});
			},
			openInEditor: (editorId) => {
				const resolvedEditorId = editorId ?? defaultEditorId;
				if (!originalLocation || !resolvedEditorId || !editorAvailable) {
					return;
				}

				openOriginalPositionInEditor(originalLocation, resolvedEditorId).catch(
					(err) => {
						showNotification((err as Error).message, 2000);
					},
				);
			},
			originalLocation,
			selectAsset,
			sequence: contextMenuTarget.sequence,
			sourceActions: sourceEditingEnabled
				? [
						...(contextMenuTarget.nodePathInfo.supportsEffects
							? [
									{
										type: 'item' as const,
										id: 'add-effect',
										keyHint: null,
										label: 'Add effect...',
										leftItem: null,
										disabled: !canAddEffect,
										onClick: () => {
											if (
												!canAddEffect ||
												previewServerState.type !== 'connected'
											) {
												return;
											}

											setSelectedModal({
												type: 'add-effect',
												clientId: previewServerState.clientId,
												fileName: nodePath.absolutePath,
												nodePath,
											});
										},
										quickSwitcherLabel: null,
										subMenu: null,
										value: 'add-effect',
									},
								]
							: []),
						{
							type: 'item' as const,
							id: 'crop',
							keyHint: null,
							label: isProgrammaticallyDuplicated ? 'Crop all' : 'Crop',
							leftItem: null,
							disabled: !canCrop,
							onClick: () => {
								if (!canCrop) {
									return;
								}

								onSelect(
									{
										type: 'sequence-prop',
										nodePathInfo: {
											...contextMenuTarget.nodePathInfo,
											auxiliaryKeys: ['controls', cropFieldKeys.left],
										},
										key: cropFieldKeys.left,
									},
									{shiftKey: false, toggleKey: false},
								);
							},
							quickSwitcherLabel: null,
							subMenu: null,
							value: 'crop',
						},
						{
							type: 'item' as const,
							id: 'rotate',
							keyHint: null,
							label: isProgrammaticallyDuplicated ? 'Rotate all' : 'Rotate',
							leftItem: null,
							disabled: !canRotate,
							onClick: () => {
								if (!canRotate) {
									return;
								}

								setManuallyEnabled(
									getTimelineSequenceSelectionKey(
										contextMenuTarget.nodePathInfo,
									),
									true,
								);
								onSelect(
									{
										type: 'sequence-prop',
										nodePathInfo: {
											...contextMenuTarget.nodePathInfo,
											auxiliaryKeys: ['controls', rotateFieldKey],
										},
										key: rotateFieldKey,
									},
									{shiftKey: false, toggleKey: false},
								);
							},
							quickSwitcherLabel: null,
							subMenu: null,
							value: 'rotate',
						},
						{
							type: 'divider' as const,
							id: 'rotate-divider',
						},
					]
				: [],
		});
	}, [
		canConfigureApps,
		codingAgentInfo,
		confirm,
		editorInfo,
		getTarget,
		onSelect,
		defaultEditorId,
		editorAvailable,
		previewServerState,
		resolveOriginalLocation,
		setManuallyEnabled,
		selectAsset,
		setSelectedModal,
		setPropStatuses,
	]);

	return (
		<>
			<SelectedOutlinePolygon
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				containsSelection={layoutTarget?.containsSelection === true}
				directlySelected={layoutTarget?.selected === true}
				dragging={dragging}
				getAllDragOutlines={getAllDragOutlines}
				getAllDragTargets={getAllDragTargets}
				getLayoutTarget={getLayoutTarget}
				getTarget={getTarget}
				hasTarget={layoutTarget !== undefined}
				hovered={hovered}
				outline={outline}
				onContextMenuOpen={onContextMenuOpen}
				onContextMenuOpenChange={onContextMenuOpenChange}
				onDraggingChange={onDraggingChange}
				onHoverChange={onHoverChange}
				onSnapPointsChange={onSnapPointsChange}
				onSelect={onSelect}
				onDoubleClickTarget={onDoubleClickTarget}
				scale={scale}
				showSelectedOutline={layoutTarget?.showSelectedOutline ?? false}
			/>
			{layoutTarget?.selectedForRotation && controlTarget?.rotationDrag ? (
				<SelectedOutlineCanvasRotation
					getLatestTargetByKey={getLatestTargetByKey}
					layoutTarget={layoutTarget}
					onDraggingChange={onDraggingChange}
					outline={outline}
					transform3DMode={controlTarget.rotationDrag.transform3DMode}
				/>
			) : null}
			<SelectedOutlineCropControls
				outline={outline}
				onDraggingChange={onDraggingChange}
				target={controlTarget}
			/>
			{controlTarget?.cropDrag === null &&
			(layoutTarget?.containsSelection || hovered)
				? controlLayout.scaleEdges.map((edge) => (
						<SelectedOutlineScaleEdgeLine
							key={edge}
							getAllScaleDragTargets={getAllScaleDragTargets}
							dragging={dragging}
							edge={edge}
							hitWidth={
								edge === 'top' || edge === 'bottom'
									? controlLayout.scaleHitWidth.horizontal
									: controlLayout.scaleHitWidth.vertical
							}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onContextMenuOpenChange={onContextMenuOpenChange}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={controlTarget}
						/>
					))
				: null}
			{controlTarget?.cropDrag === null &&
			(layoutTarget?.containsSelection || hovered)
				? controlLayout.rotationCorners.map(({corner, point}) => (
						<SelectedOutlineRotationCornerHandle
							key={corner}
							getAllRotationDragTargets={getAllRotationDragTargets}
							corner={corner}
							dragging={dragging}
							handlePoint={point}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onContextMenuOpenChange={onContextMenuOpenChange}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							radius={controlLayout.rotationHandleRadius}
							target={controlTarget}
						/>
					))
				: null}
		</>
	);
};

export const SelectedOutlineElement = React.memo(
	SelectedOutlineElementUnmemoized,
);
