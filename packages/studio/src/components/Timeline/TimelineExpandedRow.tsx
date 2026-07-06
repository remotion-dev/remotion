import React from 'react';
import type {SequencePropsSubscriptionKey, InteractivitySchema} from 'remotion';
import type {CodePosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {WHITE_ALPHA_80} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {TimelineTreeNode} from '../../helpers/timeline-layout';
import {
	EXPANDED_SECTION_PADDING_RIGHT,
	getTreeRowHeight,
	TREE_GROUP_ROW_HEIGHT,
} from '../../helpers/timeline-layout';
import type {GetIsExpanded} from '../ExpandedTracksProvider';
import {getExpandedRowDepth} from './timeline-row-layout';
import {TimelineEffectItem} from './TimelineEffectItem';
import {TimelineEffectPropItem} from './TimelineEffectPropItem';
import {
	TimelineExpandArrowButton,
	TimelineExpandArrowSpacer,
} from './TimelineExpandArrowButton';
import type {TimelineKeyframeControlsMode} from './TimelineKeyframeControls';
import {TimelineLayerEyeSpacer} from './TimelineLayerEye';
import {TimelineRowChrome} from './TimelineRowChrome';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	useTimelineRowSelection,
} from './TimelineSelection';
import {TimelineSequencePropItem} from './TimelineSequencePropItem';

const rowLabel: React.CSSProperties = {
	fontSize: 12,
	color: WHITE_ALPHA_80,
	userSelect: 'none',
};

export const TimelineExpandedRow: React.FC<{
	readonly node: TimelineTreeNode;
	readonly depth: number;
	readonly nestedDepth: number;
	readonly rowDepthBase?: number;
	readonly getIsExpanded: GetIsExpanded;
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
	readonly validatedLocation: CodePosition;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly keyframeDisplayOffset: number;
	readonly keyframeControlsMode?: TimelineKeyframeControlsMode;
}> = ({
	node,
	depth,
	nestedDepth,
	rowDepthBase,
	getIsExpanded,
	toggleTrack,
	validatedLocation,
	nodePath,
	schema,
	keyframeDisplayOffset,
	keyframeControlsMode,
}) => {
	const rowDepth =
		(rowDepthBase ?? getExpandedRowDepth({nestedDepth, treeDepth: 0})) + depth;
	const selection = useTimelineRowSelection(node.nodePathInfo);
	const labelStyle = React.useMemo(
		(): React.CSSProperties => ({
			...rowLabel,
			...getTimelineSelectedLabelStyle(selection.selected, true),
			alignSelf: 'stretch',
			alignItems: 'center',
			color: getTimelineColor(selection.selected, true),
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
				// A single effect
				<TimelineEffectItem
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

		// Group like "Effects"
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
				selectionItem={selection.selectionItem}
				onSelect={selection.onSelect}
				showSelectedBackground
				containsSelection={false}
				outerHeight={null}
			>
				<span style={labelStyle}>{node.label}</span>
			</TimelineRowChrome>
		);
	}

	if (node.field) {
		if (node.field.kind === 'effect-field') {
			return (
				<TimelineEffectPropItem
					field={node.field}
					validatedLocation={validatedLocation}
					rowDepth={rowDepth}
					nodePath={nodePath}
					nodePathInfo={node.nodePathInfo}
					keyframeDisplayOffset={keyframeDisplayOffset}
					keyframeControlsMode={keyframeControlsMode}
				/>
			);
		}

		if (node.field.kind === 'sequence-field') {
			return (
				<TimelineSequencePropItem
					field={node.field}
					validatedLocation={validatedLocation}
					rowDepth={rowDepth}
					nodePath={nodePath}
					nodePathInfo={node.nodePathInfo}
					schema={schema}
					keyframeDisplayOffset={keyframeDisplayOffset}
					keyframeControlsMode={keyframeControlsMode}
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
			selectionItem={selection.selectionItem}
			onSelect={selection.onSelect}
			showSelectedBackground
			containsSelection={false}
			outerHeight={null}
		>
			<span style={labelStyle}>{node.label}</span>
		</TimelineRowChrome>
	);
};
