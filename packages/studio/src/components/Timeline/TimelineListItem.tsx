import React, {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_LAYER_HEIGHT_AUDIO,
} from '../../helpers/timeline-layout';
import {callApi} from '../call-api';
import {ContextMenu} from '../ContextMenu';
import {ExpandedTracksContext} from '../ExpandedTracksProvider';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {Padder} from './Padder';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineExpandedSection} from './TimelineExpandedSection';
import {TimelineLayerEye} from './TimelineLayerEye';
import {TimelineStack} from './TimelineStack';
import {useResolvedStack} from './use-resolved-stack';
import {useSequencePropsSubscription} from './use-sequence-props-subscription';

export const INDENT = 10;

export const TimelineListItem: React.FC<{
	readonly sequence: TSequence;
	readonly nestedDepth: number;
	readonly isCompact: boolean;
}> = ({nestedDepth, sequence, isCompact}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const visualModeEnvEnabled = Boolean(
		process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED,
	);
	const previewConnected = previewServerState.type === 'connected';
	const visualModeActive = visualModeEnvEnabled && previewConnected;
	const {hidden, setHidden} = useContext(
		Internals.SequenceVisibilityToggleContext,
	);
	const {expandedTracks, toggleTrack} = useContext(ExpandedTracksContext);

	const originalLocation = useResolvedStack(sequence.stack ?? null);
	const {nodePath, jsxInMapCallback} = useSequencePropsSubscription(
		sequence,
		originalLocation,
		visualModeActive,
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

	const deleteDisabled = useMemo(
		() => !previewConnected || !sequence.controls || !canDeleteFromSource,
		[previewConnected, sequence.controls, canDeleteFromSource],
	);

	const duplicateDisabled = deleteDisabled;

	const onDuplicateSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		if (jsxInMapCallback) {
			const message =
				'This sequence is rendered inside a .map() callback. Duplicating inserts another copy in that callback (affecting each list item). Continue?';
			// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
			if (!window.confirm(message)) {
				return;
			}
		}

		try {
			const result = await callApi('/api/duplicate-jsx-node', {
				fileName: validatedLocation.source,
				nodePath,
			});
			if (result.success) {
				showNotification('Duplicated sequence in source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [jsxInMapCallback, nodePath, validatedLocation?.source]);

	const onDeleteSequenceFromSource = useCallback(async () => {
		if (!validatedLocation?.source || !nodePath) {
			return;
		}

		try {
			const result = await callApi('/api/delete-jsx-node', {
				fileName: validatedLocation.source,
				nodePath,
			});
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		} catch (err) {
			showNotification((err as Error).message, 4000);
		}
	}, [nodePath, validatedLocation?.source]);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		if (!visualModeEnvEnabled) {
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
		visualModeEnvEnabled,
	]);

	const isExpanded = visualModeActive && (expandedTracks[sequence.id] ?? false);

	const onToggleExpand = useCallback(() => {
		toggleTrack(sequence.id);
	}, [sequence.id, toggleTrack]);

	const isItemHidden = useMemo(() => {
		return hidden[sequence.id] ?? false;
	}, [hidden, sequence.id]);

	const onToggleVisibility = useCallback(
		(type: 'enable' | 'disable') => {
			setHidden((prev) => {
				return {
					...prev,
					[sequence.id]: type !== 'enable',
				};
			});
		},
		[sequence.id, setHidden],
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

	const trackRow = (
		<div style={outer}>
			<div style={inner}>
				<TimelineLayerEye
					type={sequence.type === 'audio' ? 'speaker' : 'eye'}
					hidden={isItemHidden}
					onInvoked={onToggleVisibility}
				/>
				<Padder depth={nestedDepth} />
				{visualModeActive ? (
					hasExpandableContent ? (
						<TimelineExpandArrowButton
							isExpanded={isExpanded}
							onClick={onToggleExpand}
							label="track properties"
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
			{visualModeEnvEnabled ? (
				<ContextMenu values={contextMenuValues}>{trackRow}</ContextMenu>
			) : (
				trackRow
			)}
			{visualModeActive && isExpanded && hasExpandableContent ? (
				<TimelineExpandedSection
					sequence={sequence}
					originalLocation={originalLocation}
					nodePath={nodePath}
					nestedDepth={nestedDepth}
				/>
			) : null}
		</>
	);
};
