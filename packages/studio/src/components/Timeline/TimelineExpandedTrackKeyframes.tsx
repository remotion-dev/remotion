import React, {useContext, useMemo} from 'react';
import {Internals, type TSequence, useVideoConfig} from 'remotion';
import {TIMELINE_TRACK_SEPARATOR, WARNING_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getExpandedTrackHeight,
	getTreeRowHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getTimelineKeyframes} from './TimelineSchemaField';
import {TimelineWidthContext} from './TimelineWidthProvider';

const row: React.CSSProperties = {
	position: 'relative',
};

const separator: React.CSSProperties = {
	height: 1,
	backgroundColor: TIMELINE_TRACK_SEPARATOR,
};

const section: React.CSSProperties = {
	borderBottom: `1px solid ${TIMELINE_TRACK_SEPARATOR}`,
};

const diamondBase: React.CSSProperties = {
	position: 'absolute',
	width: 8,
	height: 8,
	backgroundColor: WARNING_COLOR,
	borderRadius: 1,
	boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
	pointerEvents: 'none',
};

const getNodeKeyframes = ({
	node,
	nodePath,
	codeValues,
}: {
	node: ReturnType<typeof flattenVisibleTreeNodes>[number]['node'];
	nodePath: SequenceNodePathInfo['sequenceSubscriptionKey'];
	codeValues: React.ContextType<
		typeof Internals.VisualModeCodeValuesContext
	>['codeValues'];
}): ReturnType<typeof getTimelineKeyframes> => {
	if (node.kind !== 'field' || node.field === null) {
		return [];
	}

	if (node.field.kind === 'sequence-field') {
		return getTimelineKeyframes(
			Internals.getCodeValuesCtx(codeValues, nodePath)?.[node.field.key],
		);
	}

	const effectStatus = Internals.getEffectCodeValuesCtx({
		codeValues,
		nodePath,
		effectIndex: node.field.effectIndex,
	});

	return getTimelineKeyframes(
		effectStatus.type === 'can-update-effect'
			? effectStatus.props?.[node.field.key]
			: null,
	);
};

const TimelineExpandedTrackKeyframesInner: React.FC<{
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
}> = ({nodePathInfo, sequence}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides,
				codeValues,
			}),
		[codeValues, getDragOverrides, nodePathInfo, sequence],
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
				codeValues,
			}),
		[codeValues, getIsExpanded, nodePathInfo, sequence],
	);

	const rows = useMemo(
		() =>
			flat.map(({node}) => ({
				height: getTreeRowHeight(node),
				keyframes: getNodeKeyframes({
					node,
					nodePath: nodePathInfo.sequenceSubscriptionKey,
					codeValues,
				}),
				key: JSON.stringify(node.nodePathInfo),
			})),
		[codeValues, flat, nodePathInfo.sequenceSubscriptionKey],
	);

	return (
		<div
			style={{
				height: expandedHeight + TIMELINE_ITEM_BORDER_BOTTOM,
			}}
		>
			<div style={{...section, height: expandedHeight}}>
				{rows.map(({height, keyframes, key}, i) => {
					return (
						<React.Fragment key={key}>
							{i > 0 ? <div style={separator} /> : null}
							<div style={{...row, height}}>
								{timelineWidth === null
									? null
									: keyframes.map((keyframe) => (
											<div
												key={`${keyframe.frame}-${JSON.stringify(keyframe.value)}`}
												style={{
													...diamondBase,
													left: getXPositionOfItemInTimelineImperatively(
														keyframe.frame,
														videoConfig.durationInFrames,
														timelineWidth,
													),
													top: height / 2,
													transform: 'translate(-50%, -50%) rotate(45deg)',
												}}
												title={`Keyframe at frame ${keyframe.frame}`}
											/>
										))}
							</div>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};

export const TimelineExpandedTrackKeyframes = React.memo(
	TimelineExpandedTrackKeyframesInner,
);
