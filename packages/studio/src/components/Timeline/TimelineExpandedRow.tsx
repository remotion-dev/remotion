import React, {useMemo} from 'react';
import type {SequenceSchema, SequenceNodePath} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {
	EXPANDED_SECTION_PADDING_LEFT,
	EXPANDED_SECTION_PADDING_RIGHT,
	getTreeRowHeight,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {Padder} from './Padder';
import {TimelineExpandArrowButton} from './TimelineExpandArrowButton';
import {TimelineFieldRow} from './TimelineFieldRow';
import {INDENT} from './TimelineListItem';

const groupRowBase: React.CSSProperties = {
	height: TREE_GROUP_ROW_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

const labelOnlyRowBase: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
};

export const TimelineExpandedRow: React.FC<{
	readonly node: TimelineTreeNode;
	readonly depth: number;
	readonly nestedDepth: number;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
	readonly validatedLocation: CodePosition | null;
	readonly nodePath: SequenceNodePath | null;
	readonly schema: SequenceSchema;
}> = ({
	node,
	depth,
	nestedDepth,
	getIsExpanded,
	toggleTrack,
	validatedLocation,
	nodePath,
	schema,
}) => {
	const paddingLeft = EXPANDED_SECTION_PADDING_LEFT + depth * INDENT;

	const groupStyle = useMemo(
		(): React.CSSProperties => ({...groupRowBase, paddingLeft}),
		[paddingLeft],
	);

	const labelOnlyStyle = useMemo(
		(): React.CSSProperties => ({
			...labelOnlyRowBase,
			height: getTreeRowHeight(node),
			paddingLeft,
		}),
		[node, paddingLeft],
	);

	if (node.kind === 'group') {
		const isExpanded = getIsExpanded(node.nodePathInfo);
		return (
			<div style={groupStyle}>
				<Padder depth={nestedDepth + 1} />
				<TimelineExpandArrowButton
					isExpanded={isExpanded}
					onClick={() => toggleTrack(node.nodePathInfo)}
					label={`${node.label} section`}
				/>
				<span style={rowLabel}>{node.label}</span>
			</div>
		);
	}

	if (node.field) {
		return (
			<TimelineFieldRow
				field={node.field}
				validatedLocation={validatedLocation}
				paddingLeft={paddingLeft}
				nestedDepth={nestedDepth}
				nodePath={nodePath}
				schema={schema}
			/>
		);
	}

	return (
		<div style={labelOnlyStyle}>
			<Padder depth={nestedDepth + 1} />
			<span style={rowLabel}>{node.label}</span>
		</div>
	);
};
