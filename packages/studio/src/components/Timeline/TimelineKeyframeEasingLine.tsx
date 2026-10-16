import {canvasKeyframeEasingPresets} from '@remotion/sdk';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {useTimelineCalculator} from '../../helpers/calculate-timeline';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE, LIGHT_TEXT, WHITE_ALPHA_10} from '../../helpers/colors';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {ContextMenuForTarget} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {OverrideIdToNodePathMappingsRefContext} from '../SequencePropsSubscriptionProvider';
import {EasingPresetPreview} from './EasingEditorModal';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {getCopyContextForAgentsMenuItem} from './get-copy-context-for-agents-menu-item';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import {
	TIMELINE_MARQUEE_ITEM_ATTR,
	useCurrentTimelineSelectionStateAsRef,
	useTimelineEasingSelection,
	useTimelineMarqueeSelectableItem,
} from './TimelineSelection';
import {getOriginalLocationFromStack} from './TimelineStack/get-stack';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {
	getEasingSelections,
	type TimelineEasingValue,
	updateSelectedTimelineEasings,
} from './update-selected-easing';
import {useTimelineEasingKeyframeDrag} from './use-timeline-keyframe-drag';

const hitTargetHeight = 12;
const lineHeight = 2;

const easingLineButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	height: hitTargetHeight,
	padding: 0,
	position: 'absolute',
	transform: 'translateY(-50%)',
};

const easingLine: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_10,
	borderRadius: lineHeight / 2,
	height: lineHeight,
	left: 0,
	position: 'absolute',
	right: 0,
	top: '50%',
	transform: 'translateY(-50%)',
};

export const getTimelineKeyframeEasingLineStyle = (
	selected: boolean,
): React.CSSProperties => ({
	...easingLine,
	outline: selected ? `1px solid ${BLUE}` : undefined,
});

const TimelineKeyframeEasingLineVisualUnmemoized: React.FC<{
	readonly selected: boolean;
}> = ({selected}) => {
	const lineStyle = useMemo(
		() => getTimelineKeyframeEasingLineStyle(selected),
		[selected],
	);

	return <div style={lineStyle} />;
};

export const TimelineKeyframeEasingLineVisual = React.memo(
	TimelineKeyframeEasingLineVisualUnmemoized,
);

type TimelineKeyframeEasingLineProps = {
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly rowHeight: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly segmentIndex: number;
};

const TimelineKeyframeEasingLineInteraction: React.FC<
	TimelineKeyframeEasingLineProps & {
		readonly style: React.CSSProperties;
	}
> = ({fromFrame, toFrame, nodePathInfo, segmentIndex, style}) => {
	const calculateTimeline = useTimelineCalculator();
	const buttonRef = useRef<HTMLButtonElement>(null);
	const {selected, onSelect, selectable, selectionItem} =
		useTimelineEasingSelection({
			nodePathInfo,
			fromFrame,
			toFrame,
			segmentIndex,
		});
	useTimelineMarqueeSelectableItem(selectionItem, buttonRef, null);
	const interactiveStyle = useMemo(
		() => ({
			...style,
			pointerEvents: selectable ? ('auto' as const) : ('none' as const),
		}),
		[selectable, style],
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const overrideIdToNodePathMappingsRef = useContext(
		OverrideIdToNodePathMappingsRefContext,
	);
	const currentSelection = useCurrentTimelineSelectionStateAsRef();

	const getTargetSelections = useCallback(() => {
		const selectedEasings = getEasingSelections(
			currentSelection.current.selectedItems,
		);
		return selected ? selectedEasings : [selectionItem];
	}, [currentSelection, selected, selectionItem]);

	const updateEasing = useCallback(
		(easing: TimelineEasingValue) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			const promise = updateSelectedTimelineEasings({
				selections: getTargetSelections(),
				tracks: calculateTimeline({
					sequences: sequencesRef.current,
					overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
				}).tracks,
				propStatuses: propStatusesRef.current,
				setPropStatuses,
				clientId: previewServerState.clientId,
				easing,
			});
			promise?.catch(() => undefined);
		},
		[
			calculateTimeline,
			getTargetSelections,
			overrideIdToNodePathMappingsRef,
			previewServerState,
			propStatusesRef,
			sequencesRef,
			setPropStatuses,
		],
	);

	const getContextMenuItems = useCallback(
		(event: MouseEvent): ComboboxValue[] | false => {
			if (!selectable) {
				return false;
			}

			if (!selected) {
				onSelect({
					shiftKey: event.shiftKey,
					toggleKey: event.metaKey || event.ctrlKey,
				});
			}

			const field = parseKeyframeFieldFromNodePath(nodePathInfo.auxiliaryKeys);
			const track = findTrackForNodePathInfo({
				tracks: calculateTimeline({
					sequences: sequencesRef.current,
					overrideIdsToNodePaths: overrideIdToNodePathMappingsRef.current,
				}).tracks,
				nodePathInfo,
			});
			const stack = track?.sequence.getStack() ?? null;

			return [
				...canvasKeyframeEasingPresets.map((preset) => ({
					type: 'item' as const,
					id: preset.id,
					keyHint: null,
					label: preset.label,
					leftItem: (
						<EasingPresetPreview
							color={LIGHT_TEXT}
							easing={preset.easing}
							height={18}
							nonScalingStroke
							strokeWidth={1.5}
							width={18}
						/>
					),
					disabled: previewServerState.type !== 'connected',
					onClick: () => updateEasing(preset.easing),
					quickSwitcherLabel: null,
					subMenu: null,
					value: preset.id,
				})),
				{
					type: 'divider',
					id: 'copy-context-for-agents-divider',
				},
				getCopyContextForAgentsMenuItem({
					contextForAgents:
						field === null || stack === null
							? null
							: async () => {
									const location = await getOriginalLocationFromStack(
										stack,
										'sequence',
									);
									return formatContextForAgents({
										location,
										name: `${field.type === 'effect' ? 'Effect property' : 'Property'} "${field.fieldKey}", easing from frame ${fromFrame} to ${toFrame}`,
										root: window.remotion_cwd,
									});
								},
				}),
			];
		},
		[
			calculateTimeline,
			fromFrame,
			nodePathInfo,
			onSelect,
			overrideIdToNodePathMappingsRef,
			previewServerState.type,
			selectable,
			selected,
			sequencesRef,
			toFrame,
			updateEasing,
		],
	);

	const onPointerDown = useTimelineEasingKeyframeDrag({
		onSelect,
		selectable,
		selected,
		selectionItem,
	});

	return (
		<>
			<button
				ref={buttonRef}
				{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
				type="button"
				style={interactiveStyle}
				aria-label={`Select easing from frame ${fromFrame} to ${toFrame}`}
				onPointerDown={selectable ? onPointerDown : undefined}
			>
				<TimelineKeyframeEasingLineVisual selected={selected} />
			</button>
			<ContextMenuForTarget
				triggerRef={buttonRef}
				getItems={getContextMenuItems}
			/>
		</>
	);
};

const TimelineKeyframeEasingLineUnmemoized: React.FC<
	TimelineKeyframeEasingLineProps
> = ({fromFrame, toFrame, rowHeight, nodePathInfo, segmentIndex}) => {
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);

	const style = useMemo((): React.CSSProperties | null => {
		if (timelineWidth === null) {
			return null;
		}

		const fromLeft =
			getXPositionOfItemInTimelineImperatively(
				fromFrame,
				videoConfig.durationInFrames,
				timelineWidth,
			) - TIMELINE_PADDING;
		const toLeft =
			getXPositionOfItemInTimelineImperatively(
				toFrame,
				videoConfig.durationInFrames,
				timelineWidth,
			) - TIMELINE_PADDING;
		const left = Math.min(fromLeft, toLeft);
		const width = Math.abs(toLeft - fromLeft);
		if (width === 0) {
			return null;
		}

		return {
			...easingLineButton,
			left,
			top: rowHeight / 2,
			width,
		};
	}, [
		fromFrame,
		rowHeight,
		timelineWidth,
		toFrame,
		videoConfig.durationInFrames,
	]);

	if (style === null) {
		return null;
	}

	return (
		<TimelineKeyframeEasingLineInteraction
			fromFrame={fromFrame}
			toFrame={toFrame}
			rowHeight={rowHeight}
			nodePathInfo={nodePathInfo}
			segmentIndex={segmentIndex}
			style={style}
		/>
	);
};

export const TimelineKeyframeEasingLine = React.memo(
	TimelineKeyframeEasingLineUnmemoized,
);
