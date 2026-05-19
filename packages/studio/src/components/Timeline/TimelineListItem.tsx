import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT_AUDIO,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {Padder} from './Padder';
import {saveSequenceProp} from './save-sequence-prop';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineLayerEye, TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineStack} from './TimelineStack';
import {useResolvedStack} from './use-resolved-stack';

export const INDENT = 10;

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

	const originalLocation = useResolvedStack(sequence.stack ?? null);

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
				!codeHiddenStatus.canUpdate
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
			});
		},
		[
			codeHiddenStatus,
			codeValuesForOverride,
			nodePath,
			sequence.controls,
			setCodeValues,
			validatedLocation,
		],
	);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			height:
				getTimelineLayerHeight(sequence.type) + TIMELINE_ITEM_BORDER_BOTTOM,
			borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
		};
	}, [sequence.type]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			// TODO: Not so small
			height: TIMELINE_LAYER_HEIGHT_AUDIO,
			color: 'white',
			fontFamily: 'Arial, Helvetica, sans-serif',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			wordBreak: 'break-all',
			textAlign: 'left',
			paddingLeft: 5,
		};
	}, []);

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
		<div style={outer}>
			<div style={inner}>
				{canToggleVisibility ? (
					<TimelineLayerEye
						type={sequence.type === 'audio' ? 'speaker' : 'eye'}
						hidden={isItemHidden}
						onInvoked={onToggleVisibility}
					/>
				) : (
					<TimelineLayerEyeSpacer />
				)}
				<Padder depth={nestedDepth} />
				{previewConnected ? (
					hasExpandableContent ? (
						<TimelineExpandArrowButton
							isExpanded={isExpanded}
							onClick={onToggleExpand}
							label="track properties"
							disabled={nodePathInfo === null}
						/>
					) : (
						<TimelineExpandArrowSpacer />
					)
				) : null}
				<TimelineStack
					sequence={sequence}
					isCompact={isCompact}
					originalLocation={originalLocation}
				/>
			</div>
		</div>
	);

	return (
		<>
			{previewConnected ? (
				<ContextMenu values={contextMenuValues}>{trackRow}</ContextMenu>
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
