import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {TIMELINE_TRACK_SEPARATOR, WHITE} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	flattenVisibleTreeNodes,
	getTreeRowHeight,
} from '../../helpers/timeline-layout';
import {TimelineExpandedRow} from './TimelineExpandedRow';
import {useTimelineExpandedTree} from './use-timeline-expanded-tree';

const expandedSectionBase: React.CSSProperties = {
	color: WHITE,
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
	readonly keyframeDisplayOffset: number;
}> = ({
	sequence,
	validatedLocation,
	nodePathInfo,
	nestedDepth,
	keyframeDisplayOffset,
}) => {
	const {filteredTree, getIsExpanded, toggleTrack} = useTimelineExpandedTree({
		sequence,
		nodePathInfo,
		includeTextContent: false,
		includeSourceControls: false,
	});

	const flat = useMemo(
		() => flattenVisibleTreeNodes({nodes: filteredTree, getIsExpanded}),
		[filteredTree, getIsExpanded],
	);

	const expandedHeight = useMemo(() => {
		const totalRowsHeight = flat.reduce(
			(sum, {node}) => sum + getTreeRowHeight(node),
			0,
		);
		const separators = Math.max(0, flat.length - 1);
		return totalRowsHeight + separators;
	}, [flat]);

	const style = useMemo(() => {
		return {
			...expandedSectionBase,
			height: expandedHeight,
		};
	}, [expandedHeight]);

	const {schema} = sequence.controls!;

	if (flat.length === 0) {
		return null;
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
							keyframeDisplayOffset={keyframeDisplayOffset}
						/>
					</React.Fragment>
				);
			})}
		</div>
	);
};
