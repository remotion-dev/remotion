import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {LIGHT_TEXT} from '../../helpers/colors';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {
	getFieldsToShow,
	SCHEMA_FIELD_GROUPS,
} from '../../helpers/timeline-layout';
import {useRuntimeValueSnapshots} from '../../helpers/use-runtime-values';
import {SplitIcon} from '../../icons/split';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {getCurrentFrame} from '../Timeline/imperative-state';
import {splitSelectedTimelineItems} from '../Timeline/split-selected-timeline-item';
import {
	INSPECTOR_TIMELINE_ROW_LAYOUT,
	TimelineRowLayoutContext,
} from '../Timeline/TimelineRowLayoutContext';
import type {TimelineSelection} from '../Timeline/TimelineSelection';
import {CollapsibleInspectorSection} from './CollapsibleInspectorSection';
import {
	InspectorMessage,
	InspectorQuickAction,
	InspectorQuickActionsSection,
	largeInspectorActionIconContainerStyle,
	largeInspectorActionIconStyle,
} from './common';
import {
	MultiSequenceField,
	type MultiSequenceTarget,
} from './MultiSequenceField';
import {SequencePrecomposeAction} from './SequencePrecomposeAction';
import {scrollableContainer, sequenceHeaderDivider} from './styles';

const selectionCountStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	height: COMPACT_CONTROL_ROW_HEIGHT,
	lineHeight: `${COMPACT_CONTROL_ROW_HEIGHT}px`,
	overflow: 'hidden',
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px`,
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const MultiSequenceInspector: React.FC<{
	readonly selections: readonly Extract<
		TimelineSelection,
		{type: 'sequence'}
	>[];
	readonly readOnlyStudio: boolean;
}> = ({selections, readOnlyStudio}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequences = Internals.useSequenceManagerSequences();
	const calculateTimeline = useTimelineCalculator();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const tracksBySource = useMemo(() => {
		const {tracks} = calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
		const bySource = new Map<string, Map<number, TimelineTrackData>>();
		for (const track of tracks) {
			if (track.nodePathInfo === null) {
				continue;
			}

			const key = stringifySequenceExpandedRowKey(
				track.nodePathInfo.sequenceSubscriptionKey,
			);
			const instances =
				bySource.get(key) ?? new Map<number, TimelineTrackData>();
			// Match the first track for this source and rendered instance.
			if (!instances.has(track.nodePathInfo.index)) {
				instances.set(track.nodePathInfo.index, track);
			}

			bySource.set(key, instances);
		}

		return bySource;
	}, [calculateTimeline, overrideIdToNodePathMappings, sequences]);
	const selectedTracks = useMemo(
		() =>
			selections.map(({nodePathInfo}) => {
				const key = stringifySequenceExpandedRowKey(
					nodePathInfo.sequenceSubscriptionKey,
				);
				return {
					key,
					nodePathInfo,
					track: tracksBySource.get(key)?.get(nodePathInfo.index),
				};
			}),
		[selections, tracksBySource],
	);
	const targets = useMemo(() => {
		const result: MultiSequenceTarget[] = [];
		const seen = new Set<string>();
		for (const {key, track} of selectedTracks) {
			if (!track?.sequence.controls || !track.nodePathInfo) {
				return null;
			}

			// Multiple rendered instances can share the same editable source.
			if (seen.has(key)) {
				continue;
			}

			seen.add(key);
			result.push({
				nodePath: track.nodePathInfo.sequenceSubscriptionKey,
				controls: track.sequence.controls,
			});
		}

		return result;
	}, [selectedTracks]);
	const precomposeTargets = useMemo(() => {
		return selectedTracks.map(({nodePathInfo, track}) => {
			return {
				nodePathInfo,
				displayName: track?.sequence.displayName ?? null,
				line: null,
				singleChildComponent: track?.sequence.singleChildComponent ?? null,
				isTransition: track?.sequence.timelineTrack?.role === 'transition',
			};
		});
	}, [selectedTracks]);
	const runtimeControls = useMemo(
		() => (targets ?? []).map((target) => target.controls),
		[targets],
	);
	const runtimeValues = useRuntimeValueSnapshots(runtimeControls);
	const fields = useMemo(() => {
		const allFields = (targets ?? []).map(
			(target, index) =>
				getFieldsToShow({
					schema: target.controls.schema,
					currentRuntimeValueDotNotation: runtimeValues[index],
					getDragOverrides,
					propStatuses,
					nodePath: target.nodePath,
					includeTextContent: true,
				}) ?? [],
		);
		return (allFields[0] ?? []).filter((field) =>
			allFields.every((candidate) =>
				candidate.some(
					(other) =>
						other.key === field.key && other.fieldSchema === field.fieldSchema,
				),
			),
		);
	}, [getDragOverrides, propStatuses, runtimeValues, targets]);
	const canSplit = !readOnlyStudio && isStudioInteractivityEnabled();
	const onSplit = useCallback(() => {
		if (!canSplit) {
			return;
		}

		splitSelectedTimelineItems({
			selections,
			tracks: calculateTimeline({
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
			}).tracks,
			propStatuses,
			splitFrame: getCurrentFrame(),
		})?.catch(() => undefined);
	}, [
		canSplit,
		calculateTimeline,
		overrideIdToNodePathMappings,
		propStatuses,
		selections,
		sequences,
	]);

	return (
		<div style={scrollableContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<InspectorInfoHeader padding="4px 0">
				<div style={selectionCountStyle}>
					{selections.length} sequences selected
				</div>
			</InspectorInfoHeader>
			<div role="separator" style={sequenceHeaderDivider} />
			{targets === null ? (
				<InspectorMessage>Sequence controls unavailable</InspectorMessage>
			) : fields.length === 0 ? (
				<InspectorMessage>No shared controls</InspectorMessage>
			) : (
				<TimelineRowLayoutContext.Provider
					value={INSPECTOR_TIMELINE_ROW_LAYOUT}
				>
					{SCHEMA_FIELD_GROUPS.map((group) => {
						const groupedFields = fields.filter(
							(field) => field.group === group.id,
						);
						return groupedFields.length === 0 ? null : (
							<CollapsibleInspectorSection
								key={group.id}
								bodyPaddingBottom={8}
								collapsible
								label={group.label}
								sectionId={`multi-sequence-${group.id}`}
							>
								{groupedFields.map((field) => (
									<MultiSequenceField
										key={
											JSON.stringify(targets.map((target) => target.nodePath)) +
											field.key
										}
										field={field}
										targets={targets}
										readOnlyStudio={readOnlyStudio}
									/>
								))}
							</CollapsibleInspectorSection>
						);
					})}
				</TimelineRowLayoutContext.Provider>
			)}
			<CollapsibleInspectorSection
				bodyPaddingBottom={8}
				collapsible
				label="Actions"
				sectionId="multi-sequence-actions"
			>
				<InspectorQuickActionsSection>
					<InspectorQuickAction
						disabled={!canSplit}
						iconContainerStyle={largeInspectorActionIconContainerStyle}
						onClick={onSplit}
						aria-label={canSplit ? undefined : 'Studio is read-only'}
						renderIcon={(color) => (
							<SplitIcon style={largeInspectorActionIconStyle} color={color} />
						)}
					>
						Split selected
					</InspectorQuickAction>
					<SequencePrecomposeAction
						targets={precomposeTargets}
						sourceActionsDisabled={
							previewServerState.type !== 'connected' ||
							readOnlyStudio ||
							!isStudioInteractivityEnabled()
						}
					/>
				</InspectorQuickActionsSection>
			</CollapsibleInspectorSection>
		</div>
	);
};
