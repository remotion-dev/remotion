import React, {useContext, useMemo} from 'react';
import {Internals, type TSequence, useVideoConfig} from 'remotion';
import {LIGHT_TEXT, TIMELINE_TRACK_SEPARATOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
	getExpandedTrackHeight,
	getTreeRowHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
	TIMELINE_PADDING,
} from '../../helpers/timeline-layout';
import {ExpandedTracksGetterContext} from '../ExpandedTracksProvider';
import {getTimelineKeyframes} from './get-timeline-keyframes';
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
	backgroundColor: LIGHT_TEXT,
	borderRadius: 1,
	boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.4)',
	pointerEvents: 'none',
};

const getNodeKeyframes = ({
	node,
	nodePath,
	codeValues,
	keyframeDisplayOffset,
}: {
	node: ReturnType<typeof flattenVisibleTreeNodes>[number]['node'];
	nodePath: SequenceNodePathInfo['sequenceSubscriptionKey'];
	codeValues: React.ContextType<
		typeof Internals.VisualModeCodeValuesContext
	>['codeValues'];
	keyframeDisplayOffset: number;
}): ReturnType<typeof getTimelineKeyframes> => {
	if (node.kind !== 'field' || node.field === null) {
		return [];
	}

	if (node.field.kind === 'sequence-field') {
		return getTimelineKeyframes(
			Internals.getCodeValuesCtx(codeValues, nodePath)?.[node.field.key],
			keyframeDisplayOffset,
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
		keyframeDisplayOffset,
	);
};

const TimelineExpandedTrackKeyframesInner: React.FC<{
	readonly sequence: TSequence;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly keyframeDisplayOffset: number;
}> = ({nodePathInfo, sequence, keyframeDisplayOffset}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {getIsExpanded} = useContext(ExpandedTracksGetterContext);
	const {codeValues} = useContext(Internals.VisualModeCodeValuesContext);

	const tree = useMemo(
		() =>
			buildTimelineTree({
				sequence,
				nodePathInfo,
				getDragOverrides: () => ({}),
				getEffectDragOverrides: () => ({}),
				codeValues,
			}),
		[codeValues, nodePathInfo, sequence],
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
					keyframeDisplayOffset,
				}),
				key: JSON.stringify(node.nodePathInfo),
			})),
		[
			codeValues,
			flat,
			keyframeDisplayOffset,
			nodePathInfo.sequenceSubscriptionKey,
		],
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
												key={String(keyframe.frame)}
												style={{
													...diamondBase,
													left:
														getXPositionOfItemInTimelineImperatively(
															keyframe.frame,
															videoConfig.durationInFrames,
															timelineWidth,
														) - TIMELINE_PADDING,
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
