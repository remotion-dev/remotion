import {KEYFRAME_EASING_PRESETS} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {BLUE, LINE_COLOR} from '../../helpers/colors';
import {getXPositionOfItemInTimelineImperatively} from '../../helpers/get-left-of-timeline-slider';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_PADDING} from '../../helpers/timeline-layout';
import {ContextMenuForTarget} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {
	useCurrentTimelineSelectionStateAsRef,
	useTimelineEasingSelection,
} from './TimelineSelection';
import {TimelineWidthContext} from './TimelineWidthProvider';
import {
	getEasingSelections,
	updateSelectedTimelineEasings,
} from './update-selected-easing';

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
	backgroundColor: LINE_COLOR,
	borderRadius: lineHeight / 2,
	height: lineHeight,
	left: 0,
	position: 'absolute',
	right: 0,
	top: '50%',
	transform: 'translateY(-50%)',
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

	const updateEasing = useCallback(
		(easing: (typeof KEYFRAME_EASING_PRESETS)[number]['easing']) => {
			if (previewServerState.type !== 'connected') {
				return;
			}

			const selectedEasings = getEasingSelections(
				currentSelection.current.selectedItems,
			);
			const selections = selected ? selectedEasings : [selectionItem];
			const promise = updateSelectedTimelineEasings({
				selections,
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
			currentSelection,
			overrideIdToNodePathMappings,
			previewServerState,
			propStatusesRef,
			selected,
			selectionItem,
			sequencesRef,
			setPropStatuses,
		],
	);

	const contextMenuValues = useMemo((): ComboboxValue[] => {
		return KEYFRAME_EASING_PRESETS.map((preset) => ({
			type: 'item',
			id: preset.id,
			keyHint: null,
			label: preset.label,
			leftItem: null,
			disabled: previewServerState.type !== 'connected',
			onClick: () => updateEasing(preset.easing),
			quickSwitcherLabel: null,
			subMenu: null,
			value: preset.id,
		}));
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

	const lineStyle = useMemo(
		(): React.CSSProperties => ({
			...easingLine,
			outline: selected ? `1px solid ${BLUE}` : undefined,
		}),
		[selected],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (!selectable || event.button !== 0) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			onSelect({
				shiftKey: event.shiftKey,
				toggleKey: event.metaKey || event.ctrlKey,
			});
		},
		[onSelect, selectable],
	);

	if (style === null) {
		return null;
	}

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				style={style}
				title={`Easing from frame ${fromFrame} to ${toFrame}`}
				aria-label={`Select easing from frame ${fromFrame} to ${toFrame}`}
				onPointerDown={selectable ? onPointerDown : undefined}
			>
				<div style={lineStyle} />
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
