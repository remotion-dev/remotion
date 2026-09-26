import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
} from 'react';
import {Internals} from 'remotion';
import {calculateTimeline} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {LIGHT_TEXT} from '../../helpers/colors';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {
	getFieldsToShow,
	SCHEMA_FIELD_GROUPS,
} from '../../helpers/timeline-layout';
import {SplitIcon} from '../../icons/split';
import {InspectorInfoHeader} from '../InspectorInfoHeader';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {COMPACT_CONTROL_ROW_HEIGHT} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
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
	const {sequences} = useContext(Internals.SequenceManager);
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const targets = useMemo(() => {
		const tracks = calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
		const result: MultiSequenceTarget[] = [];
		const seen = new Set<string>();
		for (const selection of selections) {
			const key = stringifySequenceExpandedRowKey(
				selection.nodePathInfo.sequenceSubscriptionKey,
			);
			const track = tracks.find(
				(candidate) =>
					candidate.nodePathInfo !== null &&
					stringifySequenceExpandedRowKey(
						candidate.nodePathInfo.sequenceSubscriptionKey,
					) === key &&
					candidate.nodePathInfo.index === selection.nodePathInfo.index,
			);
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
	}, [overrideIdToNodePathMappings, selections, sequences]);
	const precomposeTargets = useMemo(() => {
		const tracks = calculateTimeline({
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
		});
		return selections.map(({nodePathInfo}) => {
			const key = stringifySequenceExpandedRowKey(
				nodePathInfo.sequenceSubscriptionKey,
			);
			const track = tracks.find(
				(candidate) =>
					candidate.nodePathInfo !== null &&
					stringifySequenceExpandedRowKey(
						candidate.nodePathInfo.sequenceSubscriptionKey,
					) === key &&
					candidate.nodePathInfo.index === nodePathInfo.index,
			);
			return {
				nodePathInfo,
				displayName: track?.sequence.displayName ?? null,
				line: null,
			};
		});
	}, [overrideIdToNodePathMappings, selections, sequences]);
	const store = useMemo(() => {
		const stores = (targets ?? []).map(
			(target) => target.controls.runtimeValues,
		);
		let snapshots = stores.map((value) => value.getSnapshot());
		return {
			subscribe: (listener: () => void) => {
				const unsubscribes = stores.map((value) => value.subscribe(listener));
				return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
			},
			getSnapshot: () => {
				const next = stores.map((value) => value.getSnapshot());
				if (next.some((value, index) => value !== snapshots[index])) {
					snapshots = next;
				}

				return snapshots;
			},
		};
	}, [targets]);
	const runtimeValues = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
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
			sequences,
			overrideIdsToNodePaths: overrideIdToNodePathMappings,
			propStatuses,
			splitFrame: timelinePosition,
		})?.catch(() => undefined);
	}, [
		canSplit,
		overrideIdToNodePathMappings,
		propStatuses,
		selections,
		sequences,
		timelinePosition,
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
