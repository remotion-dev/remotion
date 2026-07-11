import {type ReorderSequencePosition} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	BLACK_ALPHA_85,
	BORDER_TIMELINE_DROP_BLUE,
	BORDER_WHITE_ALPHA_20,
	TIMELINE_BLUE,
	TIMELINE_DROP_BLUE_ALPHA_16,
	WHITE,
} from '../../helpers/colors';
import {formatFileLocation} from '../../helpers/format-file-location';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {studioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {getStudioKeyboardShortcutsEnabled} from '../../helpers/studio-runtime-config';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LIST_ITEM_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {useKeybinding} from '../../helpers/use-keybinding';
import {ModalsContext} from '../../state/modals';
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
import {showNotification} from '../Notifications/NotificationCenter';
import {useSelectAsset} from '../use-select-asset';
import {disableSequenceInteractivity} from './disable-sequence-interactivity';
import {duplicateSequencesFromSource} from './duplicate-selected-timeline-item';
import {getSequenceContextMenuItems} from './get-sequence-context-menu-items';
import {saveSequenceProps} from './save-sequence-prop';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineMediaInfo} from './TimelineMediaInfo';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	isTimelineSelectionModifierEvent,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
	useTimelineSelection,
} from './TimelineSelection';
import {TimelineSequenceName} from './TimelineSequenceName';
import {useOpenSequenceInEditor} from './use-open-sequence-in-editor';
import {useRenameSequence} from './use-rename-sequence';
import {useSequenceFreezeFrameMenuItem} from './use-sequence-freeze-frame-menu-item';
import {useTimelineExpandedTree} from './use-timeline-expanded-tree';

const labelContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexDirection: 'row',
	minWidth: 0,
};

const effectDropHighlight: React.CSSProperties = {
	backgroundColor: TIMELINE_DROP_BLUE_ALPHA_16,
	outline: BORDER_TIMELINE_DROP_BLUE,
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

const TimelineSequenceExpandArrow: React.FC<{
	readonly disabled: boolean;
	readonly isExpanded: boolean;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly onToggleExpand: () => void;
	readonly sequence: TSequence;
}> = ({disabled, isExpanded, nodePathInfo, onToggleExpand, sequence}) => {
	const {filteredTree} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
		includeTextContent: false,
	});

	if (filteredTree.length === 0) {
		return <TimelineExpandArrowSpacer />;
	}

	return (
		<TimelineExpandArrowButton
			isExpanded={isExpanded}
			onClick={onToggleExpand}
			label="track properties"
			disabled={disabled}
		/>
	);
};

const sequenceReorderWrapper: React.CSSProperties = {
	position: 'relative',
};

const sequenceReorderLineBase: React.CSSProperties = {
	backgroundColor: TIMELINE_BLUE,
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const sequenceReorderRejectionStyle: React.CSSProperties = {
	backgroundColor: BLACK_ALPHA_85,
	border: BORDER_WHITE_ALPHA_20,
	borderRadius: 4,
	color: WHITE,
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
	readonly sequenceFrameOffset: number;
	readonly trackIndex: number;
}> = ({
	nestedDepth,
	sequence,
	nodePathInfo,
	keyframeDisplayOffset,
	sequenceFrameOffset,
	trackIndex,
}) => {
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const previewInteractive = previewConnected && studioInteractivityEnabled;
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {setSelectedModal} = useContext(ModalsContext);
	const {isHighestContext} = useKeybinding();
	const selectAsset = useSelectAsset();
	const {onSelect, selectable, selected, selectionItem} =
		useTimelineRowSelection(nodePathInfo);
	const {selectedItems} = useTimelineSelection();
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const [effectDropHovered, setEffectDropHovered] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [sequenceDropIndicator, setSequenceDropIndicator] =
		useState<ReorderSequencePosition | null>(null);
	const [sequenceDropRejection, setSequenceDropRejection] = useState<
		string | null
	>(null);
	const timelinePosition = Internals.Timeline.useTimelinePosition();

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

	const {
		canRename: canRenameThisSequence,
		displayName,
		fallbackDisplayName,
		propStatusesForOverride,
		saveName,
	} = useRenameSequence({
		clientId:
			previewInteractive && previewServerState.type === 'connected'
				? previewServerState.clientId
				: null,
		nodePathInfo,
		sequence,
		validatedLocation,
	});

	const canDeleteFromSource = Boolean(nodePath && validatedLocation?.source);
	const nodePathKey = useMemo(
		() =>
			nodePath ? Internals.makeSequencePropsSubscriptionKey(nodePath) : null,
		[nodePath],
	);
	const parentId = sequence.parent ?? null;
	const canReorderSequence =
		previewInteractive &&
		Boolean(nodePath && nodePathKey && validatedLocation?.source) &&
		nodePathInfo?.numberOfSequencesWithThisNodePath === 1;
	const canHandleSequenceDrag = previewInteractive;
	const confirm = useConfirmationDialog();

	const deleteDisabled = useMemo(
		() => !previewInteractive || !sequence.controls || !canDeleteFromSource,
		[previewInteractive, sequence.controls, canDeleteFromSource],
	);

	const duplicateDisabled = deleteDisabled;
	const disableInteractivityDisabled =
		!previewInteractive ||
		!sequence.showInTimeline ||
		!nodePath ||
		!validatedLocation?.source;

	const onDuplicateSequenceFromSource = useCallback(() => {
		if (duplicateDisabled || !validatedLocation?.source || !nodePathInfo) {
			return;
		}

		duplicateSequencesFromSource([nodePathInfo], confirm).catch(
			() => undefined,
		);
	}, [confirm, duplicateDisabled, nodePathInfo, validatedLocation?.source]);

	const onDeleteSequenceFromSource = useCallback(async () => {
		if (deleteDisabled || !validatedLocation?.source || !nodePath) {
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
	}, [
		confirm,
		deleteDisabled,
		nodePath,
		validatedLocation?.source,
		nodePathInfo,
	]);

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

	const isExpanded =
		previewConnected && nodePathInfo !== null && getIsExpanded(nodePathInfo);

	const onToggleExpand = useCallback(() => {
		if (nodePathInfo === null) {
			return;
		}

		toggleTrack(nodePathInfo);
	}, [nodePathInfo, toggleTrack]);

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
			color: WHITE,
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
		studioInteractivityEnabled &&
		(Boolean(sequence.controls) || sequence.effects.length > 0);

	const canToggleVisibility =
		previewInteractive &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		codeHiddenStatus !== undefined &&
		codeHiddenStatus !== null &&
		codeHiddenStatus.status === 'static';

	const onSequenceDoubleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (isTimelineSelectionModifierEvent(e)) {
				e.stopPropagation();
				return;
			}

			e.stopPropagation();
			if (canRenameThisSequence) {
				setIsRenaming(true);
				return;
			}

			openInEditor();
		},
		[canRenameThisSequence, openInEditor],
	);

	const canRenameSelectedSequence =
		canRenameThisSequence &&
		selected &&
		selectedItems.length === 1 &&
		selectedItems[0]?.type === 'sequence';

	const onCancelRenaming = useCallback(() => {
		setIsRenaming(false);
	}, []);

	const onSaveName = useCallback(
		async (name: string) => {
			setIsRenaming(false);
			await saveName(name);
		},
		[saveName],
	);

	React.useEffect(() => {
		if (!canRenameSelectedSequence || !getStudioKeyboardShortcutsEnabled()) {
			setIsRenaming(false);
			return;
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (!isHighestContext) {
				return;
			}

			const commandKey = window.navigator.platform.startsWith('Mac')
				? e.metaKey
				: e.ctrlKey;

			if (commandKey || e.key.toLowerCase() !== 'enter') {
				return;
			}

			if (
				document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement
			) {
				return;
			}

			e.preventDefault();
			e.stopImmediatePropagation();
			setIsRenaming(true);
		};

		window.addEventListener('keydown', onKeyDown, true);

		return () => {
			window.removeEventListener('keydown', onKeyDown, true);
		};
	}, [canRenameSelectedSequence, isHighestContext]);

	const onRenameSequence = useCallback(() => {
		if (!canRenameThisSequence) {
			return;
		}

		setIsRenaming(true);
	}, [canRenameThisSequence]);

	const freezeFrameMenuItem = useSequenceFreezeFrameMenuItem({
		clientId:
			previewInteractive && previewServerState.type === 'connected'
				? previewServerState.clientId
				: null,
		nodePath,
		propStatusesForOverride,
		sequence,
		sequenceFrameOffset,
		setPropStatuses,
		timelinePosition,
		validatedSource: validatedLocation?.source ?? null,
	});

	const canAddEffect =
		nodePathInfo?.supportsEffects === true &&
		previewInteractive &&
		Boolean(validatedLocation?.source);

	const onAddEffect = useCallback(() => {
		if (
			!canAddEffect ||
			previewServerState.type !== 'connected' ||
			!nodePath ||
			!validatedLocation?.source
		) {
			return;
		}

		setSelectedModal({
			type: 'add-effect',
			clientId: previewServerState.clientId,
			fileName: validatedLocation.source,
			nodePath,
		});
	}, [
		canAddEffect,
		nodePath,
		previewServerState,
		setSelectedModal,
		validatedLocation?.source,
	]);

	const contextMenuValues = useMemo(() => {
		if (!previewConnected) {
			return [];
		}

		return getSequenceContextMenuItems({
			assetLinkInfo,
			canOpenInEditor,
			deleteDisabled,
			disableInteractivityDisabled,
			duplicateDisabled,
			fileLocation,
			includeSourceEditItems: studioInteractivityEnabled,
			onDeleteSequenceFromSource,
			onDisableSequenceInteractivity,
			onDuplicateSequenceFromSource,
			openInEditor,
			originalLocation,
			selectAsset,
			sequence,
			sourceActions: studioInteractivityEnabled
				? [
						...(nodePathInfo?.supportsEffects
							? [
									{
										type: 'item' as const,
										id: 'add-effect',
										keyHint: null,
										label: 'Add effect...',
										leftItem: null,
										disabled: !canAddEffect,
										onClick: onAddEffect,
										quickSwitcherLabel: null,
										subMenu: null,
										value: 'add-effect',
									},
									{
										type: 'divider' as const,
										id: 'add-effect-divider',
									},
								]
							: []),
						{
							type: 'item' as const,
							id: 'rename-sequence',
							keyHint: null,
							label: 'Rename...',
							leftItem: null,
							disabled: !canRenameThisSequence,
							onClick: () => {
								onRenameSequence();
							},
							quickSwitcherLabel: null,
							subMenu: null,
							value: 'rename-sequence',
						},
						...(freezeFrameMenuItem ? [freezeFrameMenuItem] : []),
					]
				: [],
		});
	}, [
		assetLinkInfo,
		canAddEffect,
		canOpenInEditor,
		canRenameThisSequence,
		deleteDisabled,
		disableInteractivityDisabled,
		duplicateDisabled,
		fileLocation,
		freezeFrameMenuItem,
		nodePathInfo?.supportsEffects,
		onAddEffect,
		onDeleteSequenceFromSource,
		onDisableSequenceInteractivity,
		onDuplicateSequenceFromSource,
		onRenameSequence,
		openInEditor,
		originalLocation,
		previewConnected,
		selectAsset,
		sequence,
	]);
	const canDropEffect =
		previewInteractive &&
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
				hasExpandableContent && nodePathInfo !== null ? (
					<TimelineSequenceExpandArrow
						disabled={!previewInteractive}
						isExpanded={isExpanded}
						nodePathInfo={nodePathInfo}
						onToggleExpand={onToggleExpand}
						sequence={sequence}
					/>
				) : (
					<TimelineExpandArrowSpacer />
				)
			}
			style={rowStyle}
			selected={selected}
			selectable={selectable}
			selectionItem={selectionItem}
			onSelect={onSelect}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={outerHeight}
			onDragLeave={canDropEffect ? onEffectDragLeave : undefined}
			onDragOver={canDropEffect ? onEffectDragOver : undefined}
			onDrop={canDropEffect ? onEffectDrop : undefined}
			onDoubleClick={
				canRenameThisSequence || canOpenInEditor
					? onSequenceDoubleClick
					: undefined
			}
		>
			<div style={labelContainerStyle}>
				<TimelineSequenceName
					displayName={displayName}
					fallbackDisplayName={fallbackDisplayName}
					selected={selected}
					containsSelection={containsSelection}
					editing={isRenaming}
					onCancelEditing={onCancelRenaming}
					onSaveName={onSaveName}
				/>
				{mediaSrc ? (
					<>
						<Spacing x={0.5} /> <TimelineMediaInfo src={mediaSrc} />
					</>
				) : null}
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
			studioInteractivityEnabled &&
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
