import React from 'react';
import type {SequencePropsSubscriptionKey, SequenceSchema} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	getTreeRowHeight,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {getExpandedRowDepth} from './timeline-row-layout';
import {TimelineEffectFieldRow} from './TimelineEffectFieldRow';
import {TimelineEffectGroupRow} from './TimelineEffectGroupRow';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import {TimelineFieldRow} from './TimelineFieldRow';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_TEXT,
	useTimelineRowSelection,
} from './TimelineSelection';

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: 'rgba(255, 255, 255, 0.8)',
	userSelect: 'none',
};

export const TimelineExpandedRow: React.FC<{
	readonly node: TimelineTreeNode;
	readonly depth: number;
	readonly nestedDepth: number;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
	readonly validatedLocation: CodePosition;
	readonly nodePath: SequencePropsSubscriptionKey;
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
	const rowDepth = getExpandedRowDepth({nestedDepth, treeDepth: depth});
	const selection = useTimelineRowSelection(node.nodePathInfo);
	const labelStyle = React.useMemo(
		(): React.CSSProperties => ({
			...rowLabel,
			...getTimelineSelectedLabelStyle(selection.selected),
			alignSelf: 'stretch',
			alignItems: 'center',
			color: selection.selected ? TIMELINE_SELECTED_LABEL_TEXT : rowLabel.color,
			display: 'flex',
			flex: 1,
			minWidth: 0,
			paddingRight: EXPANDED_SECTION_PADDING_RIGHT,
		}),
		[selection.selected],
	);

	if (node.kind === 'group') {
		if (node.effectInfo) {
			return (
				<TimelineEffectGroupRow
					label={node.label}
					nodePathInfo={node.nodePathInfo}
					effectIndex={node.effectInfo.effectIndex}
					effectSchema={node.effectInfo.effectSchema}
					documentationLink={node.effectInfo.documentationLink}
					nodePath={nodePath}
					validatedLocation={validatedLocation}
					rowDepth={rowDepth}
					getIsExpanded={getIsExpanded}
					toggleTrack={toggleTrack}
				/>
			);
		}

		const isExpanded = getIsExpanded(node.nodePathInfo);
		return (
			<TimelineRowChrome
				depth={rowDepth}
				eye={<TimelineLayerEyeSpacer />}
				arrow={
					<TimelineExpandArrowButton
						isExpanded={isExpanded}
						onClick={() => toggleTrack(node.nodePathInfo)}
						label={`${node.label} section`}
						disabled={false}
					/>
				}
				style={{
					height: TREE_GROUP_ROW_HEIGHT,
				}}
				selected={selection.selected}
				selectable={selection.selectable}
				onSelect={selection.onSelect}
			>
				<span style={labelStyle}>{node.label}</span>
			</TimelineRowChrome>
		);
	}

	if (node.field) {
		if (node.field.kind === 'effect-field') {
			return (
				<TimelineEffectFieldRow
					field={node.field}
					validatedLocation={validatedLocation}
					rowDepth={rowDepth}
					nodePath={nodePath}
					nodePathInfo={node.nodePathInfo}
				/>
			);
		}

		if (node.field.kind === 'sequence-field') {
			return (
				<TimelineFieldRow
					field={node.field}
					validatedLocation={validatedLocation}
					rowDepth={rowDepth}
					nodePath={nodePath}
					nodePathInfo={node.nodePathInfo}
					schema={schema}
				/>
			);
		}

		throw new Error(
			'Unexpected field kind: ' + JSON.stringify(node.field satisfies never),
		);
	}

	return (
		<TimelineRowChrome
			depth={rowDepth}
			eye={<TimelineLayerEyeSpacer />}
			arrow={<TimelineExpandArrowSpacer />}
			style={{
				height: getTreeRowHeight(node),
			}}
			selected={selection.selected}
			selectable={selection.selectable}
			onSelect={selection.onSelect}
		>
			<span style={labelStyle}>{node.label}</span>
		</TimelineRowChrome>
	);
};
