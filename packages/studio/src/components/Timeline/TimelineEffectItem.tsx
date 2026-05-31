import React, {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
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
	useTimelineRowSelection,
} from './TimelineSelection';

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

export const TimelineEffectItem: React.FC<{
	readonly label: string;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly effectIndex: number;
	readonly effectSchema: SequenceSchema;
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
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const selection = useTimelineRowSelection(nodePathInfo);

	const effectStatus = useMemo(
		() =>
			Internals.getEffectCodeValuesCtx({
				codeValues,
				nodePath,
				effectIndex,
			}),
		[codeValues, nodePath, effectIndex],
	);

	const disabledStatus =
		effectStatus.type === 'can-update-effect'
			? (effectStatus.props?.disabled ?? null)
			: null;

	const isDisabled = useMemo(() => {
		if (disabledStatus && disabledStatus.canUpdate) {
			return Boolean(disabledStatus.codeValue);
		}

		return false;
	}, [disabledStatus]);

	const canToggle =
		previewConnected && disabledStatus !== null && disabledStatus.canUpdate;

	const deleteDisabled =
		!previewConnected ||
		effectStatus.type !== 'can-update-effect' ||
		!validatedLocation.source;

	const onDeleteEffectFromSource = useCallback(async () => {
		if (deleteDisabled) {
			return;
		}

		try {
			const result = await callApi('/api/delete-effect', {
				fileName: validatedLocation.source,
				sequenceNodePath: nodePath,
				effectIndex,
			});
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
				fileName: validatedLocation.source,
				nodePath,
				effectIndex,
				fieldKey: 'disabled',
				value: newValue,
				defaultValue,
				schema: effectSchema,
				setCodeValues,
				clientId: previewServerState.clientId,
			});
		},
		[
			canToggle,
			effectIndex,
			effectSchema,
			nodePath,
			previewServerState,
			setCodeValues,
			validatedLocation.source,
		],
	);

	const isExpanded = getIsExpanded(nodePathInfo);

	const rowStyle = useMemo(
		(): React.CSSProperties => ({
			height: TREE_GROUP_ROW_HEIGHT,
		}),
		[],
	);

	const labelStyle = useMemo((): React.CSSProperties => {
		return {
			...rowLabel,
			...getTimelineSelectedLabelStyle(selection.selected, true),
			alignSelf: 'stretch',
			alignItems: 'center',
			color: getTimelineColor(selection.selected, true),
			display: 'flex',
			flex: 1,
			minWidth: 0,
			paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
		};
	}, [selection.selected]);

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
			onSelect={selection.onSelect}
			showSelectedBackground
			containsSelection={false}
			outerHeight={null}
		>
			<span title={label} style={labelStyle}>
				{label}
			</span>
		</TimelineRowChrome>
	);

	return previewConnected ? (
		<ContextMenu
			values={contextMenuValues}
			onOpen={selection.selectable ? selection.onSelect : null}
		>
			{row}
		</ContextMenu>
	) : (
		row
	);
};
