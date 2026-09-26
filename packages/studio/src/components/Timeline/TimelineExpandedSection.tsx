import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {WHITE} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	flattenVisibleTreeNodes,
	getTreeRowHeight,
} from '../../helpers/timeline-layout';
import {TimelineExpandedRow} from './TimelineExpandedRow';
import {TimelineRowSelectedBackgroundContext} from './TimelineRowChrome';
import {
	TIMELINE_BACKGROUND,
	TIMELINE_EXPANDED_SELECTED_BACKGROUND,
} from './TimelineSelection';
import {useTimelineExpandedTree} from './use-timeline-expanded-tree';

const expandedSectionBase: React.CSSProperties = {
	backgroundColor: TIMELINE_BACKGROUND,
	color: WHITE,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 12,
	display: 'flex',
	flexDirection: 'column',
};

export const TimelineExpandedSection: React.FC<{
	readonly sequence: TSequence;
	readonly validatedLocation: CodePosition;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly nestedDepth: number;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
}> = ({
	sequence,
	validatedLocation,
	nodePathInfo,
	nestedDepth,
	keyframeDisplayOffset,
	keyframePlaybackRate,
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
		return totalRowsHeight;
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
		<TimelineRowSelectedBackgroundContext.Provider
			value={TIMELINE_EXPANDED_SELECTED_BACKGROUND}
		>
			<div style={style}>
				{flat.map(({node, depth}) => {
					return (
						<TimelineExpandedRow
							key={JSON.stringify(node.nodePathInfo)}
							node={node}
							depth={depth}
							nestedDepth={nestedDepth}
							getIsExpanded={getIsExpanded}
							toggleTrack={toggleTrack}
							validatedLocation={validatedLocation}
							nodePath={nodePathInfo.sequenceSubscriptionKey}
							schema={schema}
							keyframeDisplayOffset={keyframeDisplayOffset}
							keyframePlaybackRate={keyframePlaybackRate}
							keyframeControlsMode="timeline"
						/>
					);
				})}
			</div>
		</TimelineRowSelectedBackgroundContext.Provider>
	);
};
