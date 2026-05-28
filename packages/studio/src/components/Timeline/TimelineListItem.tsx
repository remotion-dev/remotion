import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LIST_ITEM_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {saveSequenceProp} from './save-sequence-prop';
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
	useTimelineRowContainsSelection,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequenceName} from './TimelineSequenceName';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

const labelContainerStyle: React.CSSProperties = {
	alignItems: 'center',
	alignSelf: 'stretch',
	display: 'flex',
	flexDirection: 'row',
	minWidth: 0,
	gap: 4,
};

export const TimelineListItem: React.FC<{
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly isCompact: boolean;
	readonly nodePathInfo: SequenceNodePathInfo | null;
}> = ({nestedDepth, sequence, isCompact, nodePathInfo}) => {
	const nodePath = nodePathInfo?.sequenceSubscriptionKey ?? null;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {setCodeValues} = useContext(Internals.VisualModeSettersContext);
	const {onSelect, selectable, selected} =
		useTimelineRowSelection(nodePathInfo);
	const containsSelection = useTimelineRowContainsSelection(nodePathInfo);

	const originalLocation = useResolveStackAndReactToChange(sequence.getStack);

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

	const deleteDisabled = useMemo(
		() => !previewConnected || !sequence.controls || !canDeleteFromSource,
		[previewConnected, sequence.controls, canDeleteFromSource],
	);

	const duplicateDisabled = deleteDisabled;

	const onDuplicateSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		if (nodePathInfo && nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
			const message =
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Duplicating inserts another copy. Continue?';
			// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
			if (!window.confirm(message)) {
				return;
			}
		}

		try {
			const result = await callApi('/api/duplicate-jsx-node', {
				fileName: validatedLocation.source,
				nodePath: nodePath.nodePath,
			});
			if (result.success) {
				showNotification('Duplicated sequence in source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [nodePath, validatedLocation?.source, nodePathInfo]);

	const onDeleteSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		if (nodePathInfo && nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
			const message =
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Deleting removes all instances. Continue?';
			// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
			if (!window.confirm(message)) {
				return;
			}
		}

		try {
			const result = await callApi('/api/delete-jsx-node', {
				fileName: validatedLocation.source,
				nodePath: nodePath.nodePath,
			});
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [nodePath, validatedLocation?.source, nodePathInfo]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		if (!previewConnected) {
			return [];
		}

		return [
			{
				type: 'item',
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
				type: 'item',
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
		];
	}, [
		deleteDisabled,
		duplicateDisabled,
		onDeleteSequenceFromSource,
		onDuplicateSequenceFromSource,
		previewConnected,
	]);

	const isExpanded =
		previewConnected && nodePathInfo !== null && getIsExpanded(nodePathInfo);

	const onToggleExpand = useCallback(() => {
		if (nodePathInfo === null) {
			return;
		}

		toggleTrack(nodePathInfo);
	}, [nodePathInfo, toggleTrack]);

	const codeValuesForOverride = useMemo(() => {
		return nodePath
			? Internals.getCodeValuesCtx(codeValues, nodePath)
			: undefined;
	}, [codeValues, nodePath]);

	const codeHiddenStatus = codeValuesForOverride?.hidden;

	const isItemHidden = useMemo(() => {
		const codeValue =
			codeHiddenStatus && codeHiddenStatus.canUpdate
				? codeHiddenStatus.codeValue
				: undefined;
		const runtimeValue =
			sequence.controls?.currentRuntimeValueDotNotation.hidden;
		const effective = (codeValue ?? runtimeValue) as boolean | undefined;
		return effective ?? false;
	}, [codeHiddenStatus, sequence.controls?.currentRuntimeValueDotNotation]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			if (
				!sequence.controls ||
				!nodePath ||
				!validatedLocation ||
				!codeValuesForOverride ||
				!codeHiddenStatus ||
				!codeHiddenStatus.canUpdate ||
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

			saveSequenceProp({
				fileName: validatedLocation.source,
				nodePath,
				fieldKey: 'hidden',
				value: newValue,
				defaultValue,
				schema,
				setCodeValues,
				clientId: previewServerState.clientId,
			});
		},
		[
			codeHiddenStatus,
			codeValuesForOverride,
			nodePath,
			previewServerState,
			sequence.controls,
			setCodeValues,
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

	const mediaSrc =
		sequence.type === 'audio' ||
		sequence.type === 'video' ||
		sequence.type === 'image'
			? sequence.src
			: null;

	const hasExpandableContent =
		Boolean(sequence.controls) || sequence.effects.length > 0;

	const canToggleVisibility =
		previewConnected &&
		Boolean(sequence.controls) &&
		nodePath !== null &&
		validatedLocation !== null &&
		codeHiddenStatus !== undefined &&
		codeHiddenStatus !== null &&
		codeHiddenStatus.canUpdate;

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
			style={inner}
			selected={selected}
			selectable={selectable}
			onSelect={onSelect}
			showSelectedBackground
			containsSelection={containsSelection}
			outerHeight={outerHeight}
		>
			<div style={labelContainerStyle}>
				<TimelineSequenceName
					sequence={sequence}
					selected={selected}
					containsSelection={containsSelection}
				/>
				{mediaSrc ? <TimelineMediaInfo src={mediaSrc} /> : null}
				<TimelineItemStack
					isCompact={isCompact}
					originalLocation={originalLocation}
				/>
			</div>
		</TimelineRowChrome>
	);

	return (
		<>
			{previewConnected ? (
				<ContextMenu
					values={contextMenuValues}
					onOpen={selectable ? onSelect : null}
				>
					{trackRow}
				</ContextMenu>
			) : (
				trackRow
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
				/>
			) : null}
		</>
	);
};
