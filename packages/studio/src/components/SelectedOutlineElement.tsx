import React, {useContext, useLayoutEffect, useMemo, useRef} from 'react';
import type {ResolvedStackLocation} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {formatFileLocation} from '../helpers/format-file-location';
import {getConnectedCompositions} from '../helpers/get-connected-compositions';
import {getSequenceDoubleClickAction} from '../helpers/get-sequence-double-click-action';
import {isStudioInteractivityEnabled} from '../helpers/interactivity-enabled';
import {openOriginalPositionInEditor} from '../helpers/open-in-editor';
import {timelineSequenceNodePathToKey} from '../helpers/timeline-node-path-key';
import {SetSelectedModalContext} from '../state/modals';
import {
	useIsTimelineSequenceHovered,
	useSetTimelineSequenceHover,
} from '../state/timeline-sequence-hover';
import {callApi} from './call-api';
import {useConfirmationDialog} from './ConfirmationDialog';
import {useSelectComposition} from './InitialCompositionLoader';
import {showNotification} from './Notifications/NotificationCenter';
import type {SelectedOutline} from './selected-outline-geometry';
import {type SelectedOutlineSnapPoint} from './selected-outline-snap';
import {
	cropFieldKeys,
	type SelectedOutlineDragTarget,
	type SelectedOutlineRotationDragTarget,
	type SelectedOutlineScaleDragTarget,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {SelectedOutlineCropControls} from './SelectedOutlineCropControls';
import {SelectedOutlinePolygon} from './SelectedOutlinePolygon';
import {SelectedOutlineRotationCornerHandle} from './SelectedOutlineRotationCornerHandle';
import {SelectedOutlineScaleEdgeLine} from './SelectedOutlineScaleEdgeLine';
import {disableSequenceInteractivity} from './Timeline/disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './Timeline/duplicate-selected-timeline-item';
import {getSequenceContextMenuItems} from './Timeline/get-sequence-context-menu-items';
import {getTimelineAssetLinkInfo} from './Timeline/timeline-asset-link';
import type {
	TimelineSelection,
	TimelineSelectionInteraction,
} from './Timeline/TimelineSelection';
import {getOriginalLocationFromStack} from './Timeline/TimelineStack/get-stack';
import {useSelectAsset} from './use-select-asset';
type SelectedOutlineElementProps = {
	readonly allRotationDragTargets: readonly SelectedOutlineRotationDragTarget[];
	readonly allScaleDragTargets: readonly SelectedOutlineScaleDragTarget[];
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly dragging: boolean;
	readonly getAllDragOutlines: () => readonly SelectedOutline[];
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
	readonly getLatestTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly outline: SelectedOutline;
	readonly onDraggingChange: (dragging: boolean) => void;
	readonly onSnapPointsChange: (
		snapPoints: readonly SelectedOutlineSnapPoint[],
	) => void;
	readonly onSelect: (
		item: TimelineSelection,
		interaction: TimelineSelectionInteraction,
	) => void;
	readonly scale: number;
	readonly target: SelectedOutlineTarget | undefined;
};

const SelectedOutlineElementUnmemoized: React.FC<
	SelectedOutlineElementProps
> = ({
	allRotationDragTargets,
	allScaleDragTargets,
	compositionHeight,
	compositionWidth,
	dragging,
	getAllDragOutlines,
	getAllDragTargets,
	getLatestTargetByKey,
	outline,
	onDraggingChange,
	onSnapPointsChange,
	onSelect,
	scale,
	target,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const updateResolvedStackTrace = useContext(
		Internals.SequenceStackTracesUpdateContext,
	);
	const confirm = useConfirmationDialog();
	const selectAsset = useSelectAsset();
	const selectComposition = useSelectComposition();
	const {compositions} = useContext(Internals.CompositionManager);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const setHoveredSequence = useSetTimelineSequenceHover();
	const targetRef = useRef(target);
	useLayoutEffect(() => {
		targetRef.current = target;
	}, [target]);
	const getTarget = React.useCallback(() => {
		const currentTarget = targetRef.current;
		if (currentTarget === undefined) {
			return undefined;
		}

		return getLatestTargetByKey(currentTarget.key) ?? currentTarget;
	}, [getLatestTargetByKey]);
	const hoveredNodePathKey = useMemo(
		() =>
			target === undefined
				? null
				: timelineSequenceNodePathToKey(
						target.nodePathInfo.sequenceSubscriptionKey,
					),
		[target],
	);
	const hovered = useIsTimelineSequenceHovered(hoveredNodePathKey);
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
				canOpenInEditor:
					previewServerState.type === 'connected' &&
					Boolean(window.remotion_editorName),
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
				if (originalLocation === null) {
					return;
				}

				await openOriginalPositionInEditor(originalLocation, null);
			};

			openTargetInEditor().catch((err) => {
				showNotification((err as Error).message, 2000);
			});

			return true;
		},
		[
			compositions,
			previewServerState.type,
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

		const fileLocation = formatFileLocation({
			location: originalLocation,
			root: window.remotion_cwd,
		});
		const nodePath = contextMenuTarget.nodePathInfo.sequenceSubscriptionKey;
		const mediaSrc =
			contextMenuTarget.sequence.type === 'audio' ||
			contextMenuTarget.sequence.type === 'video' ||
			contextMenuTarget.sequence.type === 'image'
				? contextMenuTarget.sequence.src
				: null;
		const assetLinkInfo = mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null;
		const canOpenInEditor = Boolean(
			window.remotion_editorName && originalLocation,
		);
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

		return getSequenceContextMenuItems({
			assetLinkInfo,
			canOpenInEditor,
			deleteDisabled: sourceEditDisabled,
			disableInteractivityDisabled,
			duplicateDisabled: sourceEditDisabled || isProgrammaticallyDuplicated,
			editorInfo: null,
			fileLocation,
			includeSourceEditItems: sourceEditingEnabled,
			isProgrammaticallyDuplicated,
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
					const result = await callApi('/api/delete-jsx-node', {
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
			openInEditor: () => {
				if (!originalLocation) {
					return;
				}

				openOriginalPositionInEditor(originalLocation, null).catch((err) => {
					showNotification((err as Error).message, 2000);
				});
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
							label: 'Crop',
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
							type: 'divider' as const,
							id: 'crop-divider',
						},
					]
				: [],
		});
	}, [
		confirm,
		getTarget,
		onSelect,
		previewServerState,
		resolveOriginalLocation,
		selectAsset,
		setSelectedModal,
		setPropStatuses,
	]);

	return (
		<>
			<SelectedOutlinePolygon
				compositionHeight={compositionHeight}
				compositionWidth={compositionWidth}
				dragging={dragging}
				getAllDragOutlines={getAllDragOutlines}
				getAllDragTargets={getAllDragTargets}
				getTarget={getTarget}
				hasEffectDrop={target !== undefined && target.effectDrop !== null}
				hasTarget={target !== undefined}
				hovered={hovered}
				outline={outline}
				onContextMenuOpen={onContextMenuOpen}
				onDraggingChange={onDraggingChange}
				onHoverChange={onHoverChange}
				onSnapPointsChange={onSnapPointsChange}
				onSelect={onSelect}
				onDoubleClickTarget={onDoubleClickTarget}
				scale={scale}
				showSelectedOutline={target?.showSelectedOutline ?? false}
			/>
			<SelectedOutlineCropControls
				outline={outline}
				onDraggingChange={onDraggingChange}
				target={target}
			/>
			{target?.cropDrag === null && (target.containsSelection || hovered)
				? (['top', 'right', 'bottom', 'left'] as const).map((edge) => (
						<SelectedOutlineScaleEdgeLine
							key={edge}
							allScaleDragTargets={allScaleDragTargets}
							dragging={dragging}
							edge={edge}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
			{target?.cropDrag === null && (target.containsSelection || hovered)
				? (
						['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
					).map((corner) => (
						<SelectedOutlineRotationCornerHandle
							key={corner}
							allRotationDragTargets={allRotationDragTargets}
							corner={corner}
							dragging={dragging}
							outline={outline}
							onContextMenuOpen={onContextMenuOpen}
							onDraggingChange={onDraggingChange}
							onHoverChange={onHoverChange}
							onSelect={onSelect}
							target={target}
						/>
					))
				: null}
		</>
	);
};

export const SelectedOutlineElement = React.memo(
	SelectedOutlineElementUnmemoized,
);
