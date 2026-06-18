import {
	type EffectDragData,
	type ReorderSequencePosition,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {formatFileLocation} from '../../helpers/format-file-location';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LIST_ITEM_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {useConfirmationDialog} from '../ConfirmationDialog';
import {ContextMenu} from '../ContextMenu';
import {
	addEffectFromDragData,
	getEffectDragData,
	hasEffectDragType,
	hasExplicitEffectDragType,
} from '../effect-drag-and-drop';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {Spacing} from '../layout';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSelectAsset} from '../use-select-asset';
import {timelineAddEffectMenuEffects} from './add-effect-menu';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {saveSequenceProps} from './save-sequence-prop';
import {
	getTimelineAssetLinkInfo,
	openTimelineAssetLink,
} from './timeline-asset-link';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineItemStack} from './TimelineItemStack';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineMediaInfo} from './TimelineMediaInfo';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	isTimelineSelectionModifierEvent,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceName} from './TimelineSequenceName';
import {useOpenSequenceInEditor} from './use-open-sequence-in-editor';

const labelContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexDirection: 'row',
	minWidth: 0,
};

const effectDropHighlight: React.CSSProperties = {
	backgroundColor: 'rgba(0, 155, 255, 0.16)',
	outline: '1px solid rgba(0, 155, 255, 0.75)',
	outlineOffset: -1,
};

const SEQUENCE_REORDER_MIME_TYPE = 'application/remotion-sequence-reorder';

type SequenceReorderDragData = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly nodePathKey: string;
	readonly trackIndex: number;
	readonly parentId: string | null;
	readonly fileName: string;
};

let currentSequenceDrag: SequenceReorderDragData | null = null;

const sequenceReorderWrapper: React.CSSProperties = {
	position: 'relative',
};

const sequenceReorderLineBase: React.CSSProperties = {
	backgroundColor: '#0b84ff',
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const sequenceReorderRejectionStyle: React.CSSProperties = {
	backgroundColor: 'rgba(0, 0, 0, 0.85)',
	border: '1px solid rgba(255, 255, 255, 0.2)',
	borderRadius: 4,
	color: 'white',
	fontSize: 11,
	lineHeight: 1.2,
	maxWidth: 260,
	padding: '3px 6px',
	pointerEvents: 'none',
	position: 'absolute',
	right: 6,
	top: 2,
	zIndex: 2,
};

const hasSequenceReorderDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(SEQUENCE_REORDER_MIME_TYPE);
};

const isSequenceReorderDrag = (dataTransfer: DataTransfer) => {
	return (
		currentSequenceDrag !== null || hasSequenceReorderDragType(dataTransfer)
	);
};

const getSequenceReorderDragData = (
	dataTransfer: DataTransfer,
): SequenceReorderDragData | null => {
	if (currentSequenceDrag) {
		return currentSequenceDrag;
	}

	const value = dataTransfer.getData(SEQUENCE_REORDER_MIME_TYPE);
	if (!value) {
		return null;
	}

	try {
		const parsed = JSON.parse(value) as SequenceReorderDragData;
		if (
			typeof parsed.nodePathKey === 'string' &&
			typeof parsed.trackIndex === 'number' &&
			(typeof parsed.parentId === 'string' || parsed.parentId === null) &&
			typeof parsed.fileName === 'string' &&
			parsed.nodePath &&
			Array.isArray(parsed.nodePath.nodePath)
		) {
			return parsed;
		}
	} catch {
		return null;
	}

	return null;
};

const getDestinationIndex = ({
	fromIndex,
	insertionIndex,
}: {
	readonly fromIndex: number;
	readonly insertionIndex: number;
}) => {
	return insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
};

type SequenceDropTarget =
	| {
			readonly type: 'valid';
			readonly dragData: SequenceReorderDragData;
			readonly position: ReorderSequencePosition;
	  }
	| {
			readonly type: 'invalid';
			readonly reason: string;
	  };

export const TimelineSequenceItem: React.FC<{
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly nodePathInfo: SequenceNodePathInfo | null;
	readonly keyframeDisplayOffset: number;
	readonly trackIndex: number;
}> = ({
	nestedDepth,
	sequence,
	nodePathInfo,
	keyframeDisplayOffset,
	trackIndex,
}) => {
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const selectAsset = useSelectAsset();
	const {onSelect, selectable, selected} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const [sequenceDropIndicator, setSequenceDropIndicator] =
		useState<ReorderSequencePosition | null>(null);
	const [sequenceDropRejection, setSequenceDropRejection] = useState<
		string | null
	>(null);

	const {canOpenInEditor, openInEditor, originalLocation} =
		useOpenSequenceInEditor(sequence);
	const fileLocation = useMemo(
		() =>
			formatFileLocation({
				location: originalLocation,
				root: window.remotion_cwd,
			}),
		[originalLocation],
	);

	const validatedLocation = useMemo(() => {
		if (
			!originalLocation ||
			!originalLocation.source ||
			!originalLocation.line
		) {
			return null;
		}

		return {
			source: originalLocation.source,
			line: originalLocation.line,
			column: originalLocation.column ?? 0,
		};
	}, [originalLocation]);

	const canDeleteFromSource = Boolean(nodePath && validatedLocation?.source);
	const nodePathKey = useMemo(
		() =>
			nodePath ? Internals.makeSequencePropsSubscriptionKey(nodePath) : null,
		[nodePath],
	);
	const parentId = sequence.parent ?? null;
	const canReorderSequence =
		previewConnected &&
		Boolean(nodePath && nodePathKey && validatedLocation?.source) &&
		nodePathInfo?.numberOfSequencesWithThisNodePath === 1;
	const canHandleSequenceDrag = previewConnected;
	const confirm = useConfirmationDialog();

	const deleteDisabled = useMemo(
		() => !previewConnected || !sequence.controls || !canDeleteFromSource,
		[previewConnected, sequence.controls, canDeleteFromSource],
	);

	const duplicateDisabled = deleteDisabled;
	const disableInteractivityDisabled =
		!previewConnected ||
		!sequence.showInTimeline ||
		!nodePath ||
		!validatedLocation?.source;
	const addEffectDisabled =
		!previewConnected ||
		!nodePath ||
		!validatedLocation?.source ||
		sequence.controls?.supportsEffects !== true;

	const onDuplicateSequenceFromSource = useCallback(() => {
		if (!validatedLocation?.source || !nodePathInfo) {
			return;
		}

		duplicateSequencesFromSource([nodePathInfo], confirm).catch(
			() => undefined,
		);
	}, [confirm, nodePathInfo, validatedLocation?.source]);

	const onDeleteSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		if (nodePathInfo && nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
			const shouldDelete = await confirm({
				title: 'Delete sequence?',
				message:
					'This sequence is programmatically duplicated ' +
					nodePathInfo.numberOfSequencesWithThisNodePath +
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
						fileName: validatedLocation.source,
						nodePath: nodePath.nodePath,
					},
				],
			});
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [confirm, nodePath, validatedLocation?.source, nodePathInfo]);

	const onDisableSequenceInteractivity = useCallback(() => {
		if (
			disableInteractivityDisabled ||
			!nodePath ||
			!validatedLocation?.source ||
			previewServerState.type !== 'connected'
		) {
			return;
		}

		disableSequenceInteractivity({
			fileName: validatedLocation.source,
			nodePath,
			setPropStatuses,
			clientId: previewServerState.clientId,
		});
	}, [
		disableInteractivityDisabled,
		nodePath,
		previewServerState,
		setPropStatuses,
		validatedLocation?.source,
	]);

	const onAddEffectFromMenu = useCallback(
		async (dragData: EffectDragData) => {
			if (
				addEffectDisabled ||
				!nodePath ||
				!validatedLocation?.source ||
				previewServerState.type !== 'connected'
			) {
				return;
			}

			await addEffectFromDragData({
				dragData,
				fileName: validatedLocation.source,
				nodePath,
				clientId: previewServerState.clientId,
			});
		},
		[
			addEffectDisabled,
			nodePath,
			previewServerState,
			validatedLocation?.source,
		],
	);

	const getSequenceDropTarget = useCallback(
		(e: React.DragEvent<HTMLDivElement>): SequenceDropTarget | null => {
			const dragData = getSequenceReorderDragData(e.dataTransfer);
			if (!dragData) {
				return null;
			}

			if (!nodePath || !nodePathKey || !validatedLocation?.source) {
				return {
					type: 'invalid',
					reason: 'This sequence cannot be reordered from source.',
				};
			}

			if (dragData.nodePathKey === nodePathKey) {
				return {
					type: 'invalid',
					reason: 'Drop onto another sequence to reorder.',
				};
			}

			if (nodePathInfo?.numberOfSequencesWithThisNodePath !== 1) {
				return {
					type: 'invalid',
					reason: 'Programmatically duplicated sequences cannot be reordered.',
				};
			}

			if (
				dragData.parentId !== parentId ||
				dragData.fileName !== validatedLocation.source
			) {
				return {
					type: 'invalid',
					reason: 'Sequences can only be reordered with direct JSX siblings.',
				};
			}

			const rect = e.currentTarget.getBoundingClientRect();
			const before = e.clientY < rect.top + rect.height / 2;
			const insertionIndex = before ? trackIndex : trackIndex + 1;
			const toIndex = getDestinationIndex({
				fromIndex: dragData.trackIndex,
				insertionIndex,
			});

			if (toIndex === dragData.trackIndex) {
				return {
					type: 'invalid',
					reason: 'This sequence is already in that position.',
				};
			}

			return {
				type: 'valid',
				dragData,
				position: before ? ('before' as const) : ('after' as const),
			};
		},
		[
			nodePath,
			nodePathInfo?.numberOfSequencesWithThisNodePath,
			nodePathKey,
			parentId,
			trackIndex,
			validatedLocation?.source,
		],
	);

	const onSequenceDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canReorderSequence ||
				!nodePath ||
				!nodePathKey ||
				!validatedLocation?.source
			) {
				e.preventDefault();
				return;
			}

			const dragData = {
				nodePath,
				nodePathKey,
				trackIndex,
				parentId,
				fileName: validatedLocation.source,
			};
			currentSequenceDrag = dragData;
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData(
				SEQUENCE_REORDER_MIME_TYPE,
				JSON.stringify(dragData),
			);
			e.stopPropagation();
		},
		[
			canReorderSequence,
			nodePath,
			nodePathKey,
			parentId,
			trackIndex,
			validatedLocation?.source,
		],
	);

	const onSequenceDragEnd = useCallback(() => {
		currentSequenceDrag = null;
		setSequenceDropIndicator(null);
		setSequenceDropRejection(null);
	}, []);

	const onSequenceDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!hasSequenceReorderDragType(e.dataTransfer)) {
				return;
			}

			const dropTarget = getSequenceDropTarget(e);
			if (!dropTarget) {
				setSequenceDropIndicator(null);
				setSequenceDropRejection(null);
				return;
			}

			if (dropTarget.type === 'invalid') {
				setSequenceDropIndicator(null);
				setSequenceDropRejection(dropTarget.reason);
				e.dataTransfer.dropEffect = 'none';
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'move';
			setSequenceDropIndicator(dropTarget.position);
			setSequenceDropRejection(null);
		},
		[getSequenceDropTarget],
	);

	const onSequenceDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
				return;
			}

			setSequenceDropIndicator(null);
			setSequenceDropRejection(null);
		},
		[],
	);

	const onSequenceDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canReorderSequence ||
				previewServerState.type !== 'connected' ||
				!nodePath ||
				!validatedLocation?.source
			) {
				return;
			}

			const dropTarget = getSequenceDropTarget(e);
			if (!dropTarget || dropTarget.type === 'invalid') {
				setSequenceDropIndicator(null);
				setSequenceDropRejection(
					dropTarget?.type === 'invalid' ? dropTarget.reason : null,
				);
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			setSequenceDropIndicator(null);
			setSequenceDropRejection(null);
			currentSequenceDrag = null;

			try {
				const result = await callApi('/api/reorder-sequence', {
					fileName: validatedLocation.source,
					sourceNodePath: dropTarget.dragData.nodePath,
					targetNodePath: nodePath,
					position: dropTarget.position,
					clientId: previewServerState.clientId,
				});

				if (result.success) {
					showNotification('Reordered sequence', 2000);
				} else {
					showNotification(result.reason, 4000);
				}
			} catch (err) {
				showNotification((err as Error).message, 4000);
			}
		},
		[
			canReorderSequence,
			getSequenceDropTarget,
			nodePath,
			previewServerState,
			validatedLocation?.source,
		],
	);

	const mediaSrc =
		sequence.type === 'audio' ||
		sequence.type === 'video' ||
		sequence.type === 'image'
			? sequence.src
			: null;

	const assetLinkInfo = useMemo(
		() => (mediaSrc ? getTimelineAssetLinkInfo(mediaSrc) : null),
		[mediaSrc],
	);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		if (!previewConnected) {
			return [];
		}

		const editorName = window.remotion_editorName;
		const {documentationLink} = sequence;

		return [
			editorName
				? {
						type: 'item' as const,
						id: 'show-in-editor',
						keyHint: null,
						label: `Show in ${editorName}`,
						leftItem: null,
						disabled: !canOpenInEditor,
						onClick: () => {
							openInEditor();
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-in-editor',
					}
				: null,
			{
				type: 'item' as const,
				id: 'copy-file-location',
				keyHint: null,
				label: 'Copy file location',
				leftItem: null,
				disabled: !fileLocation,
				onClick: () => {
					if (!fileLocation) {
						return;
					}

					navigator.clipboard
						.writeText(fileLocation)
						.then(() => {
							showNotification('Copied file location to clipboard', 1000);
						})
						.catch((err) => {
							showNotification(
								`Could not copy to clipboard: ${(err as Error).message}`,
								1000,
							);
						});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'copy-file-location',
			},
			documentationLink
				? {
						type: 'item' as const,
						id: 'open-component-docs',
						keyHint: null,
						label: 'Open component docs',
						leftItem: null,
						disabled: false,
						onClick: () => {
							window.open(documentationLink, '_blank', 'noopener,noreferrer');
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'open-component-docs',
					}
				: null,
			assetLinkInfo
				? {
						type: 'item' as const,
						id: 'show-asset',
						keyHint: null,
						label: 'Show asset',
						leftItem: null,
						disabled: false,
						onClick: () => {
							openTimelineAssetLink(assetLinkInfo, selectAsset);
						},
						quickSwitcherLabel: null,
						subMenu: null,
						value: 'show-asset',
					}
				: null,
			documentationLink
				? {
						type: 'divider' as const,
						id: 'open-component-docs-divider',
					}
				: null,
			sequence.controls?.supportsEffects
				? {
						type: 'item' as const,
						id: 'add-effect',
						keyHint: null,
						label: 'Add effect',
						leftItem: null,
						disabled: addEffectDisabled,
						onClick: () => undefined,
						quickSwitcherLabel: null,
						subMenu: {
							preselectIndex: false as const,
							leaveLeftSpace: false,
							items: timelineAddEffectMenuEffects.map((effect) => ({
								type: 'item' as const,
								id: `add-effect-${effect.id}`,
								keyHint: null,
								label: effect.label,
								leftItem: null,
								disabled: addEffectDisabled,
								onClick: () => {
									onAddEffectFromMenu(effect.dragData);
								},
								quickSwitcherLabel: null,
								subMenu: null,
								value: `add-effect-${effect.id}`,
							})),
						},
						value: 'add-effect',
					}
				: null,
			sequence.controls?.supportsEffects
				? {
						type: 'divider' as const,
						id: 'add-effect-divider',
					}
				: null,
			{
				type: 'item' as const,
				id: 'disable-interactivity',
				keyHint: null,
				label: 'Disable interactivity',
				leftItem: null,
				disabled: disableInteractivityDisabled,
				onClick: () => {
					onDisableSequenceInteractivity();
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'disable-interactivity',
			},
			{
				type: 'item' as const,
				id: 'duplicate-sequence',
				keyHint: null,
				label: 'Duplicate',
				leftItem: null,
				disabled: duplicateDisabled,
				onClick: () => {
					if (duplicateDisabled) {
						return;
					}

					onDuplicateSequenceFromSource();
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'duplicate-sequence',
			},
			{
				type: 'item' as const,
				id: 'delete-sequence',
				keyHint: null,
				label: 'Delete',
				leftItem: null,
				disabled: deleteDisabled,
				onClick: () => {
					if (deleteDisabled) {
						return;
					}

					onDeleteSequenceFromSource();
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'delete-sequence',
			},
		].filter(NoReactInternals.truthy);
	}, [
		addEffectDisabled,
		assetLinkInfo,
		deleteDisabled,
		disableInteractivityDisabled,
		duplicateDisabled,
		fileLocation,
		onDeleteSequenceFromSource,
		onAddEffectFromMenu,
		onDisableSequenceInteractivity,
		onDuplicateSequenceFromSource,
		canOpenInEditor,
		openInEditor,
		previewConnected,
		selectAsset,
		sequence,
	]);

	const isExpanded =
		previewConnected && nodePathInfo !== null && getIsExpanded(nodePathInfo);

	const onToggleExpand = useCallback(() => {
		if (nodePathInfo === null) {
			return;
		}

		toggleTrack(nodePathInfo);
	}, [nodePathInfo, toggleTrack]);

	const onShowInEditorDoubleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!canOpenInEditor) {
				return;
			}

			if (isTimelineSelectionModifierEvent(e)) {
				e.stopPropagation();
				return;
			}

			e.stopPropagation();
			openInEditor();
		},
		[canOpenInEditor, openInEditor],
	);

	const propStatusesForOverride = useMemo(() => {
		return nodePath
			? Internals.getPropStatusesCtx(propStatuses, nodePath)
			: undefined;
	}, [propStatuses, nodePath]);

	const codeHiddenStatus = propStatusesForOverride?.hidden;

	const isItemHidden = useMemo(() => {
		const propStatus =
			codeHiddenStatus && codeHiddenStatus.status === 'static'
				? codeHiddenStatus.codeValue
				: undefined;
		const runtimeValue =
			sequence.controls?.currentRuntimeValueDotNotation.hidden;
		const effective = (propStatus ?? runtimeValue) as boolean | undefined;
		return effective ?? false;
	}, [codeHiddenStatus, sequence.controls?.currentRuntimeValueDotNotation]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			if (
				!sequence.controls ||
				!nodePath ||
				!validatedLocation ||
				!propStatusesForOverride ||
				!codeHiddenStatus ||
				codeHiddenStatus.status !== 'static' ||
				previewServerState.type !== 'connected'
			) {
				return;
			}

			const newValue = type !== 'enable';
			const {schema} = sequence.controls;

			const fieldSchema = schema.hidden;
			const defaultValue =
				fieldSchema && fieldSchema.type === 'boolean'
					? JSON.stringify(fieldSchema.default)
					: null;

			saveSequenceProps({
				changes: [
					{
						fileName: validatedLocation.source,
						nodePath,
						fieldKey: 'hidden',
						value: newValue,
						defaultValue,
						schema,
					},
				],
				setPropStatuses,
				clientId: previewServerState.clientId,
				undoLabel: newValue ? 'Hide sequence' : 'Show sequence',
				redoLabel: newValue ? 'Hide sequence again' : 'Show sequence again',
			});
		},
		[
			codeHiddenStatus,
			propStatusesForOverride,
			nodePath,
			previewServerState,
			sequence.controls,
			setPropStatuses,
			validatedLocation,
		],
	);

	const outerHeight = useMemo(
		() => getTimelineLayerHeight(sequence.type) + TIMELINE_ITEM_BORDER_BOTTOM,
		[sequence.type],
	);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			height: TIMELINE_LIST_ITEM_ROW_HEIGHT,
			color: 'white',
			fontFamily: 'Arial, Helvetica, sans-serif',
			wordBreak: 'break-all',
			textAlign: 'left',
			flexShrink: 0,
		};
	}, []);

	const rowStyle = useMemo((): React.CSSProperties => {
		return effectDropHovered
			? {
					...inner,
					...effectDropHighlight,
				}
			: inner;
	}, [effectDropHovered, inner]);

	const hasExpandableContent =
		Boolean(sequence.controls) || sequence.effects.length > 0;

	const canToggleVisibility =
		previewConnected &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		codeHiddenStatus !== undefined &&
		codeHiddenStatus !== null &&
		codeHiddenStatus.status === 'static';

	const canDropEffect =
		previewServerState.type === 'connected' &&
		nodePath !== null &&
		validatedLocation !== null &&
		sequence.controls?.supportsEffects === true;

	const sequenceReorderLineStyle = useMemo((): React.CSSProperties | null => {
		if (!sequenceDropIndicator) {
			return null;
		}

		return {
			...sequenceReorderLineBase,
			...(sequenceDropIndicator === 'before' ? {top: -1} : {bottom: -1}),
		};
	}, [sequenceDropIndicator]);

	const onEffectDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canDropEffect ||
				isSequenceReorderDrag(e.dataTransfer) ||
				!hasEffectDragType(e.dataTransfer)
			) {
				return;
			}

			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			setEffectDropHovered(true);
		},
		[canDropEffect],
	);

	const onEffectDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
				return;
			}

			setEffectDropHovered(false);
		},
		[],
	);

	const onEffectDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canDropEffect ||
				previewServerState.type !== 'connected' ||
				nodePath === null ||
				validatedLocation === null ||
				isSequenceReorderDrag(e.dataTransfer) ||
				!hasEffectDragType(e.dataTransfer)
			) {
				return;
			}

			const dragData = getEffectDragData(e.dataTransfer);
			if (!dragData) {
				if (hasExplicitEffectDragType(e.dataTransfer)) {
					e.preventDefault();
					e.stopPropagation();
					setEffectDropHovered(false);
					showNotification('Could not read effect drag data', 3000);
				}

				return;
			}

			e.preventDefault();
			e.stopPropagation();
			setEffectDropHovered(false);

			await addEffectFromDragData({
				dragData,
				fileName: validatedLocation.source,
				nodePath,
				clientId: previewServerState.clientId,
			});
		},
		[canDropEffect, nodePath, previewServerState, validatedLocation],
	);

	const trackRow = (
		<TimelineRowChrome
			depth={nestedDepth}
			eye={
				canToggleVisibility ? (
					<TimelineLayerEye
						type={sequence.type === 'audio' ? 'speaker' : 'eye'}
						hidden={isItemHidden}
						onInvoked={onToggleVisibility}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)
			}
			arrow={
				hasExpandableContent ? (
					<TimelineExpandArrowButton
						isExpanded={isExpanded}
						onClick={onToggleExpand}
						label="track properties"
						disabled={!previewConnected || nodePathInfo === null}
					/>
				) : (
					<TimelineExpandArrowSpacer />
				)
			}
			style={rowStyle}
			selected={selected}
			selectable={selectable}
			onSelect={onSelect}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={outerHeight}
			onDragLeave={canDropEffect ? onEffectDragLeave : undefined}
			onDragOver={canDropEffect ? onEffectDragOver : undefined}
			onDrop={canDropEffect ? onEffectDrop : undefined}
			onDoubleClick={canOpenInEditor ? onShowInEditorDoubleClick : undefined}
		>
			<div style={labelContainerStyle}>
				<TimelineSequenceName
					sequence={sequence}
					selected={selected}
					containsSelection={containsSelection}
				/>
				{mediaSrc ? (
					<>
						<Spacing x={0.5} /> <TimelineMediaInfo src={mediaSrc} />
					</>
				) : null}
				<Spacing x={0.5} />
				<TimelineItemStack originalLocation={originalLocation} />
			</div>
		</TimelineRowChrome>
	);

	const draggableTrackRow = canHandleSequenceDrag ? (
		<div
			draggable={canReorderSequence}
			onDragStart={onSequenceDragStart}
			onDragEnd={onSequenceDragEnd}
			onDragOver={onSequenceDragOver}
			onDragLeave={onSequenceDragLeave}
			onDrop={onSequenceDrop}
			style={sequenceReorderWrapper}
		>
			{sequenceReorderLineStyle ? (
				<div style={sequenceReorderLineStyle} />
			) : null}
			{sequenceDropRejection ? (
				<div style={sequenceReorderRejectionStyle}>{sequenceDropRejection}</div>
			) : null}
			{trackRow}
		</div>
	) : (
		trackRow
	);

	return (
		<>
			{previewConnected ? (
				<ContextMenu
					values={contextMenuValues}
					onOpen={selectable ? onSelect : null}
				>
					{draggableTrackRow}
				</ContextMenu>
			) : (
				draggableTrackRow
			)}
			{previewConnected &&
			isExpanded &&
			hasExpandableContent &&
			nodePathInfo &&
			validatedLocation ? (
				<TimelineExpandedSection
					sequence={sequence}
					validatedLocation={validatedLocation}
					nodePathInfo={nodePathInfo}
					nestedDepth={nestedDepth}
					keyframeDisplayOffset={keyframeDisplayOffset}
				/>
			) : null}
		</>
	);
};
