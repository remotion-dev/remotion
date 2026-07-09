import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_BLUE, WHITE_ALPHA_80} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {saveEffectProp} from './save-effect-prop';
import {TimelineExpandArrowButton} from './TimelineExpandArrowButton';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_BACKGROUND,
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';

const EFFECT_REORDER_MIME_TYPE = 'application/remotion-effect-reorder';

type EffectReorderDragData = {
	readonly nodePathKey: string;
	readonly effectIndex: number;
};

let currentEffectDrag: EffectReorderDragData | null = null;

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: WHITE_ALPHA_80,
	userSelect: 'none',
};

const rowStyle: React.CSSProperties = {
	height: TREE_GROUP_ROW_HEIGHT,
	cursor: 'default',
};

const reorderWrapper: React.CSSProperties = {
	position: 'relative',
};

const reorderLineBase: React.CSSProperties = {
	backgroundColor: TIMELINE_BLUE,
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const hasEffectReorderDragType = (dataTransfer: DataTransfer) => {
	return Array.from(dataTransfer.types).includes(EFFECT_REORDER_MIME_TYPE);
};

const getEffectReorderDragData = (
	dataTransfer: DataTransfer,
): EffectReorderDragData | null => {
	if (currentEffectDrag) {
		return currentEffectDrag;
	}

	const value = dataTransfer.getData(EFFECT_REORDER_MIME_TYPE);
	if (!value) {
		return null;
	}

	try {
		const parsed = JSON.parse(value) as EffectReorderDragData;
		if (
			typeof parsed.nodePathKey === 'string' &&
			typeof parsed.effectIndex === 'number'
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

export const TimelineEffectItem: React.FC<{
	readonly label: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly effectIndex: number;
	readonly effectSchema: InteractivitySchema;
	readonly documentationLink: string | null;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly validatedLocation: CodePosition;
	readonly rowDepth: number;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
}> = ({
	label,
	nodePathInfo,
	effectIndex,
	effectSchema,
	documentationLink,
	nodePath,
	validatedLocation,
	rowDepth,
	getIsExpanded,
	toggleTrack,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const selection = useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);
	const [dropIndicator, setDropIndicator] = useState<'before' | 'after' | null>(
		null,
	);

	const effectStatus = useMemo(
		() =>
			Internals.getEffectPropStatusesCtx({
				propStatuses,
				nodePath,
				effectIndex,
			}),
		[propStatuses, nodePath, effectIndex],
	);

	const disabledStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.disabled ?? null)
			: null;

	const isDisabled = useMemo(() => {
		if (disabledStatus?.status === 'static') {
			return Boolean(disabledStatus.codeValue);
		}

		return false;
	}, [disabledStatus]);

	const canToggle = previewConnected && disabledStatus?.status === 'static';

	const deleteDisabled =
		!previewConnected ||
		effectStatus.type !== 'can-update-effect' ||
		!validatedLocation.source;

	const canReorder =
		previewConnected &&
		effectStatus.type === 'can-update-effect' &&
		Boolean(validatedLocation.source);

	const nodePathKey = useMemo(
		() => Internals.makeSequencePropsSubscriptionKey(nodePath),
		[nodePath],
	);

	const onDeleteEffectFromSource = useCallback(async () => {
		if (deleteDisabled) {
			return;
		}

		try {
			const result = await callApi('/api/delete-effect', [
				{
					type: 'single-effect',
					fileName: validatedLocation.source,
					sequenceNodePath: nodePath,
					effectIndex,
				},
			]);
			if (result.success) {
				showNotification('Removed effect from source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [deleteDisabled, effectIndex, nodePath, validatedLocation.source]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		if (!previewConnected) {
			return [];
		}

		const items: ComboboxValue[] = [];

		if (documentationLink) {
			items.push({
				type: 'item',
				id: 'open-effect-docs',
				keyHint: null,
				label: 'Open effect docs',
				leftItem: null,
				disabled: false,
				onClick: () => {
					window.open(documentationLink, '_blank', 'noopener,noreferrer');
				},
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'open-effect-docs',
			});
			items.push({
				type: 'divider',
				id: 'open-effect-docs-divider',
			});
		}

		items.push({
			type: 'item',
			id: 'delete-effect',
			keyHint: null,
			label: 'Delete',
			leftItem: null,
			disabled: deleteDisabled,
			onClick: () => {
				if (deleteDisabled) {
					return;
				}

				onDeleteEffectFromSource();
			},
			quickSwitcherLabel: null,
			subMenu: null,
			value: 'delete-effect',
		});

		return items;
	}, [
		deleteDisabled,
		documentationLink,
		onDeleteEffectFromSource,
		previewConnected,
	]);

	const onToggle = useCallback(
		(type: 'enable' | 'disable') => {
			if (!canToggle || previewServerState.type !== 'connected') {
				return;
			}

			const newValue = type !== 'enable';
			const fieldSchema = effectSchema.disabled;
			const defaultValue =
				fieldSchema && fieldSchema.type === 'boolean'
					? JSON.stringify(fieldSchema.default)
					: null;

			saveEffectProp({
				type: 'value',
				fileName: validatedLocation.source,
				nodePath,
				effectIndex,
				fieldKey: 'disabled',
				value: newValue,
				defaultValue,
				schema: effectSchema,
				setPropStatuses,
				clientId: previewServerState.clientId,
			});
		},
		[
			canToggle,
			effectIndex,
			effectSchema,
			nodePath,
			previewServerState,
			setPropStatuses,
			validatedLocation.source,
		],
	);

	const isExpanded = getIsExpanded(nodePathInfo);

	const labelStyle = useMemo((): React.CSSProperties => {
		return {
			...rowLabel,
			...getTimelineSelectedLabelStyle(selection.selected, true),
			alignSelf: 'stretch',
			alignItems: 'center',
			color: getTimelineColor(selection.selected, true),
			display: 'inline-flex',
			marginRight: EXPANDED_SECTION_PADDING_RIGHT,
			minWidth: 0,
			boxShadow:
				containsSelection && !selection.selected
					? `inset 0 0 0 2px ${TIMELINE_SELECTED_LABEL_BACKGROUND}`
					: undefined,
		};
	}, [containsSelection, selection.selected]);

	const getDropTarget = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const dragData = getEffectReorderDragData(e.dataTransfer);
			if (!dragData || dragData.nodePathKey !== nodePathKey) {
				return null;
			}

			const rect = e.currentTarget.getBoundingClientRect();
			const before = e.clientY < rect.top + rect.height / 2;
			const insertionIndex = before ? effectIndex : effectIndex + 1;
			const toIndex = getDestinationIndex({
				fromIndex: dragData.effectIndex,
				insertionIndex,
			});

			if (toIndex === dragData.effectIndex) {
				return null;
			}

			return {
				dragData,
				toIndex,
				indicator: before ? ('before' as const) : ('after' as const),
			};
		},
		[effectIndex, nodePathKey],
	);

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!canReorder) {
				e.preventDefault();
				return;
			}

			const dragData = {nodePathKey, effectIndex};
			currentEffectDrag = dragData;
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData(
				EFFECT_REORDER_MIME_TYPE,
				JSON.stringify(dragData),
			);
			e.stopPropagation();
		},
		[canReorder, effectIndex, nodePathKey],
	);

	const onDragEnd = useCallback(() => {
		currentEffectDrag = null;
		setDropIndicator(null);
	}, []);

	const onDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (!canReorder || !hasEffectReorderDragType(e.dataTransfer)) {
				return;
			}

			const dropTarget = getDropTarget(e);
			if (!dropTarget) {
				setDropIndicator(null);
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'move';
			setDropIndicator(dropTarget.indicator);
		},
		[canReorder, getDropTarget],
	);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
			return;
		}

		setDropIndicator(null);
	}, []);

	const onDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			if (
				!canReorder ||
				previewServerState.type !== 'connected' ||
				!validatedLocation.source
			) {
				return;
			}

			const dropTarget = getDropTarget(e);
			if (!dropTarget) {
				setDropIndicator(null);
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			setDropIndicator(null);
			currentEffectDrag = null;

			try {
				const result = await callApi('/api/reorder-effect', {
					fileName: validatedLocation.source,
					sequenceNodePath: nodePath,
					fromIndex: dropTarget.dragData.effectIndex,
					toIndex: dropTarget.toIndex,
					clientId: previewServerState.clientId,
				});

				if (result.success) {
					showNotification('Reordered effect', 2000);
				} else {
					showNotification(result.reason, 4000);
				}
			} catch (err) {
				showNotification((err as Error).message, 4000);
			}
		},
		[
			canReorder,
			getDropTarget,
			nodePath,
			previewServerState,
			validatedLocation.source,
		],
	);

	const reorderLineStyle = useMemo((): React.CSSProperties | null => {
		if (!dropIndicator) {
			return null;
		}

		return {
			...reorderLineBase,
			...(dropIndicator === 'before' ? {top: -1} : {bottom: -1}),
		};
	}, [dropIndicator]);

	const row = (
		<TimelineRowChrome
			depth={rowDepth}
			eye={
				canToggle ? (
					<TimelineLayerEye
						type="effect"
						hidden={isDisabled}
						onInvoked={onToggle}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)
			}
			arrow={
				<TimelineExpandArrowButton
					isExpanded={isExpanded}
					onClick={() => toggleTrack(nodePathInfo)}
					label={`${label} section`}
					disabled={false}
				/>
			}
			style={rowStyle}
			selected={selection.selected}
			selectable={selection.selectable}
			selectionItem={selection.selectionItem}
			onSelect={selection.onSelect}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={null}
		>
			<span title={label} style={labelStyle}>
				{label}
			</span>
		</TimelineRowChrome>
	);

	const draggableRow = canReorder ? (
		<div
			draggable
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			style={reorderWrapper}
		>
			{reorderLineStyle ? <div style={reorderLineStyle} /> : null}
			{row}
		</div>
	) : (
		row
	);

	return previewConnected ? (
		<ContextMenu
			values={contextMenuValues}
			onOpen={selection.selectable ? selection.onSelect : null}
		>
			{draggableRow}
		</ContextMenu>
	) : (
		draggableRow
	);
};
