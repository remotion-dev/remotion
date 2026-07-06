import {
	KEYFRAME_EASING_PRESETS,
	LINEAR_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE, WHITE_ALPHA_10} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {ContextMenuForTarget} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {
	TIMELINE_MARQUEE_ITEM_ATTR,
	useCurrentTimelineSelectionStateAsRef,
	useTimelineEasingSelection,
	useTimelineMarqueeSelectableItem,
} from './TimelineSelection';
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

export const TimelineKeyframeEasingLineVisual: React.FC<{
	readonly selected: boolean;
}> = ({selected}) => {
	const lineStyle = useMemo(
		() => getTimelineKeyframeEasingLineStyle(selected),
		[selected],
	);

	return <div style={lineStyle} />;
};

const TimelineKeyframeEasingLineUnmemoized: React.FC<{
	readonly fromFrame: number;
	readonly toFrame: number;
	readonly rowHeight: number;
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly segmentIndex: number;
}> = ({fromFrame, toFrame, rowHeight, nodePathInfo, segmentIndex}) => {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const videoConfig = useVideoConfig();
	const timelineWidth = useContext(TimelineWidthContext);
	const {selected, onSelect, selectable, selectionItem} =
		useTimelineEasingSelection({
			nodePathInfo,
			fromFrame,
			toFrame,
			segmentIndex,
		});
	useTimelineMarqueeSelectableItem(selectionItem, buttonRef);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const sequencesRef = useContext(Internals.SequenceManagerRefContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {overrideIdToNodePathMappings} = useContext(
		Internals.OverrideIdsToNodePathsGettersContext,
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
				sequences: sequencesRef.current,
				overrideIdsToNodePaths: overrideIdToNodePathMappings,
				propStatuses: propStatusesRef.current,
				setPropStatuses,
				clientId: previewServerState.clientId,
				easing,
			});
			promise?.catch(() => undefined);
		},
		[
			getTargetSelections,
			overrideIdToNodePathMappings,
			previewServerState,
			propStatusesRef,
			sequencesRef,
			setPropStatuses,
		],
	);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'linear',
				keyHint: null,
				label: 'Linear',
				leftItem: null,
				disabled: previewServerState.type !== 'connected',
				onClick: () => updateEasing(LINEAR_KEYFRAME_EASING),
				quickSwitcherLabel: null,
				subMenu: null,
				value: 'linear',
			},
			...KEYFRAME_EASING_PRESETS.map((preset) => ({
				type: 'item' as const,
				id: preset.id,
				keyHint: null,
				label: preset.label,
				leftItem: null,
				disabled: previewServerState.type !== 'connected',
				onClick: () => updateEasing(preset.easing),
				quickSwitcherLabel: null,
				subMenu: null,
				value: preset.id,
			})),
		];
	}, [previewServerState.type, updateEasing]);

	const onOpenContextMenu = useCallback(
		(event: MouseEvent) => {
			if (!selectable) {
				return false;
			}

			if (!selected) {
				onSelect({
					shiftKey: event.shiftKey,
					toggleKey: event.metaKey || event.ctrlKey,
				});
			}

			return contextMenuValues;
		},
		[contextMenuValues, onSelect, selectable, selected],
	);

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
			pointerEvents: selectable ? 'auto' : 'none',
			top: rowHeight / 2,
			width,
		};
	}, [
		fromFrame,
		rowHeight,
		selectable,
		timelineWidth,
		toFrame,
		videoConfig.durationInFrames,
	]);

	const onPointerDown = useTimelineEasingKeyframeDrag({
		onSelect,
		selectable,
		selected,
		selectionItem,
	});

	if (style === null) {
		return null;
	}

	return (
		<>
			<button
				ref={buttonRef}
				{...{[TIMELINE_MARQUEE_ITEM_ATTR]: true}}
				type="button"
				style={style}
				title={`Easing from frame ${fromFrame} to ${toFrame}`}
				aria-label={`Select easing from frame ${fromFrame} to ${toFrame}`}
				onPointerDown={selectable ? onPointerDown : undefined}
			>
				<TimelineKeyframeEasingLineVisual selected={selected} />
			</button>
			<ContextMenuForTarget
				triggerRef={buttonRef}
				values={contextMenuValues}
				onOpen={onOpenContextMenu}
			/>
		</>
	);
};

export const TimelineKeyframeEasingLine = React.memo(
	TimelineKeyframeEasingLineUnmemoized,
);
