import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {EasingEditor} from '../Timeline/EasingEditorModal';
import {getTimelineSelectionKey} from '../Timeline/TimelineSelection';
import {
	getTimelineEasingValueForSelection,
	type EasingSelection,
} from '../Timeline/update-selected-easing';
import {InspectorMessage, InspectorSectionHeader} from './common';
import {
	sectionHeaderRow,
	sectionHeaderStart,
	sectionHeaderTitle,
	selectedContainer,
} from './styles';

export const EasingInspector: React.FC<{
	readonly selection: EasingSelection;
}> = ({selection}) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
	);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);

	const initialEasing = useMemo(
		() =>
			getTimelineEasingValueForSelection({
				selection,
				sequences,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses,
			}),
		[overrideIdToNodePathMappings, propStatuses, selection, sequences],
	);

	const state = useMemo(() => {
		if (initialEasing === null) {
			return null;
		}

		return {
			initialEasing,
			selections: [selection],
		};
	}, [initialEasing, selection]);

	const renderHeader = useCallback(
		(modeItems: SegmentedControlItem[]) => (
			<InspectorSectionHeader>
				<div style={sectionHeaderRow}>
					<div style={sectionHeaderStart}>
						<span style={sectionHeaderTitle}>Easing</span>
						<SegmentedControl
							items={modeItems}
							needsWrapping={false}
							size="compact"
						/>
					</div>
				</div>
			</InspectorSectionHeader>
		),
		[],
	);

	if (state === null) {
		return <InspectorMessage>Easing unavailable</InspectorMessage>;
	}

	return (
		<div style={selectedContainer} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<EasingEditor
				key={getTimelineSelectionKey(selection)}
				state={state}
				renderHeader={renderHeader}
			/>
		</div>
	);
};
