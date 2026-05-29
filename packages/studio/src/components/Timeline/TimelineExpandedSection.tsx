import React, {useContext, useMemo} from 'react';
import {Internals, type TSequence} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getExpandedTrackHeight,
} from '../../helpers/timeline-layout';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../ExpandedTracksProvider';
import {TimelineExpandedRow} from './TimelineExpandedRow';

const expandedSectionBase: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	display: 'flex',
	flexDirection: 'column',
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const separator: React.CSSProperties = {
	height: 0,
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

export const TimelineExpandedSection: React.FC<{
	readonly sequence: TSequence;
	readonly validatedLocation: CodePosition;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly nestedDepth: number;
}> = ({sequence, validatedLocation, nodePathInfo, nestedDepth}) => {
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {toggleTrack} = useContext(ExpandedTracksSetterContext);
	const {codeValues: visualModeCodeValues} = useContext(
		Internals.VisualModeCodeValuesContext,
	);
	const {getDragOverrides, getEffectDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				getEffectDragOverrides,
				codeValues: visualModeCodeValues,
			}),
		[
			sequence,
			nodePathInfo,
			getDragOverrides,
			getEffectDragOverrides,
			visualModeCodeValues,
		],
	);

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: tree, getIsExpanded}),
		[tree, getIsExpanded],
	);

	const expandedHeight = useMemo(
		() =>
			getExpandedTrackHeight({
				sequence,
				nodePathInfo,
				getIsExpanded,
				codeValues: visualModeCodeValues,
			}),
		[sequence, nodePathInfo, getIsExpanded, visualModeCodeValues],
	);

	const style = useMemo(() => {
		return {
			...expandedSectionBase,
			height: expandedHeight,
		};
	}, [expandedHeight]);

	const {schema} = sequence.controls!;

	if (flat.length === 0) {
		return <div style={style}>No schema</div>;
	}

	return (
		<div style={style}>
			{flat.map(({node, depth}, i) => {
				return (
					<React.Fragment key={JSON.stringify(node.nodePathInfo)}>
						{i > 0 ? <div style={separator} /> : null}
						<TimelineExpandedRow
							node={node}
							depth={depth}
							nestedDepth={nestedDepth}
							getIsExpanded={getIsExpanded}
							toggleTrack={toggleTrack}
							validatedLocation={validatedLocation}
							nodePath={nodePathInfo.sequenceSubscriptionKey}
							schema={schema}
						/>
					</React.Fragment>
				);
			})}
		</div>
	);
};
