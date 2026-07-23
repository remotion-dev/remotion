import React, {useCallback, useMemo} from 'react';
import {Internals, useVideoConfig} from 'remotion';
import {LIGHT_TEXT, WHITE_ALPHA_25} from '../../helpers/colors';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {InlineAction} from '../InlineAction';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {TimelineKeyframeDiamondIcon} from '../Timeline/TimelineKeyframeDiamondIcon';
import {TimelineKeyframeEasingLineVisual} from '../Timeline/TimelineKeyframeEasingLine';
import {
	getTimelineSelectionKey,
	useTimelineSelection,
	type TimelineSelection,
} from '../Timeline/TimelineSelection';
import {
	getKeyframeEasingNavigatorItems,
	getNavigatorItemPlayheadFrame,
	type NavigatorItem,
	type NavigatorKeyframe,
} from './keyframe-easing-navigator-items';

const navigatorContainer: React.CSSProperties = {
	alignItems: 'center',
	boxSizing: 'border-box',
	display: 'flex',
	gap: 8,
	justifyContent: 'space-between',
	padding: `8px ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 6px`,
	width: '100%',
};

const itemStrip: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	gap: 0,
	height: 24,
	justifyContent: 'center',
	minWidth: 0,
};

const itemButton: React.CSSProperties = {
	alignItems: 'center',
	background: 'none',
	border: 'none',
	display: 'flex',
	height: 24,
	justifyContent: 'center',
	padding: 0,
};

const diamondSize = 12;
const easingLineDiamondOverlap = diamondSize / 2;

const emptyItem: React.CSSProperties = {
	height: 24,
	width: diamondSize,
};

const easingItem: React.CSSProperties = {
	height: 12,
	position: 'relative',
	width: 38,
};

const getEasingLineUnderlay = ({
	extendLeft,
	extendRight,
}: {
	readonly extendLeft: boolean;
	readonly extendRight: boolean;
}): React.CSSProperties => {
	return {
		bottom: 0,
		left: extendLeft ? -easingLineDiamondOverlap : 0,
		pointerEvents: 'none',
		position: 'absolute',
		right: extendRight ? -easingLineDiamondOverlap : 0,
		top: 0,
	};
};

const chevronIcon: React.CSSProperties = {
	display: 'block',
	height: 12,
	width: 8,
};

const disabledChevronColor = WHITE_ALPHA_25;

const NavigationChevron: React.FC<{
	readonly color: string;
	readonly direction: 'left' | 'right';
}> = ({color, direction}) => {
	const path = direction === 'left' ? 'M6 1L2 6L6 11' : 'M2 1L6 6L2 11';

	return (
		<svg viewBox="0 0 8 12" style={chevronIcon}>
			<path
				d={path}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			/>
		</svg>
	);
};

const TimelineNavigatorItem: React.FC<{
	readonly extendLineLeft: boolean;
	readonly extendLineRight: boolean;
	readonly item: NavigatorItem | null;
	readonly onSelect: (item: NavigatorItem) => void;
	readonly selected: boolean;
}> = ({extendLineLeft, extendLineRight, item, onSelect, selected}) => {
	const onClick = useCallback(() => {
		if (item === null) {
			return;
		}

		onSelect(item);
	}, [item, onSelect]);

	if (item === null) {
		return <div style={emptyItem} />;
	}

	const buttonStyle: React.CSSProperties = {
		...itemButton,
		position: 'relative',
		width: item.type === 'easing' ? 38 : diamondSize,
		zIndex: item.type === 'keyframe' ? 1 : 0,
	};
	const lineUnderlayStyle = getEasingLineUnderlay({
		extendLeft: extendLineLeft,
		extendRight: extendLineRight,
	});

	return (
		<button
			type="button"
			style={buttonStyle}
			onClick={onClick}
			title={
				item.type === 'keyframe'
					? `Keyframe at frame ${item.selection.frame}`
					: `Easing from frame ${item.selection.fromFrame} to ${item.selection.toFrame}`
			}
			aria-label={
				item.type === 'keyframe'
					? `Select keyframe at frame ${item.selection.frame}`
					: `Select easing from frame ${item.selection.fromFrame} to ${item.selection.toFrame}`
			}
		>
			{item.type === 'keyframe' ? (
				<TimelineKeyframeDiamondIcon
					color={LIGHT_TEXT}
					selected={selected}
					size={12}
				/>
			) : (
				<div style={easingItem}>
					<div style={lineUnderlayStyle}>
						<TimelineKeyframeEasingLineVisual selected={selected} />
					</div>
				</div>
			)}
		</button>
	);
};

export const KeyframeEasingNavigator: React.FC<{
	readonly currentSelection: Extract<
		TimelineSelection,
		{type: 'keyframe'} | {type: 'easing'}
	>;
	readonly includeEasings: boolean;
	readonly keyframes: readonly NavigatorKeyframe[];
	readonly nodePathInfo: SequenceNodePathInfo;
}> = ({currentSelection, includeEasings, keyframes, nodePathInfo}) => {
	const {isSelected, selectItems} = useTimelineSelection();
	const setFrame = Internals.useTimelineSetFrame();
	const videoConfig = useVideoConfig();
	const items = useMemo(
		() =>
			getKeyframeEasingNavigatorItems({
				includeEasings,
				keyframes,
				nodePathInfo,
			}),
		[includeEasings, keyframes, nodePathInfo],
	);
	const currentKey = getTimelineSelectionKey(currentSelection);
	const currentIndex = items.findIndex(
		(item) => getTimelineSelectionKey(item.selection) === currentKey,
	);
	const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
	const currentItem = currentIndex === -1 ? null : items[currentIndex];
	const nextItem =
		currentIndex === -1 || currentIndex >= items.length - 1
			? null
			: items[currentIndex + 1];

	const selectItem = useCallback(
		(item: NavigatorItem) => {
			selectItems([item.selection], {reveal: true});
		},
		[selectItems],
	);
	const seekToItem = useCallback(
		(item: NavigatorItem) => {
			const frame = getNavigatorItemPlayheadFrame(item);
			setFrame((current) => {
				const next = {...current, [videoConfig.id]: frame};
				Internals.persistCurrentFrame(next);
				return next;
			});
		},
		[setFrame, videoConfig.id],
	);
	const selectPrevious = useCallback(() => {
		if (previousItem === null) {
			return;
		}

		seekToItem(previousItem);
		selectItem(previousItem);
	}, [previousItem, seekToItem, selectItem]);
	const selectNext = useCallback(() => {
		if (nextItem === null) {
			return;
		}

		seekToItem(nextItem);
		selectItem(nextItem);
	}, [nextItem, seekToItem, selectItem]);

	if (currentItem === null) {
		return null;
	}

	return (
		<div style={navigatorContainer}>
			<InlineAction
				disabled={previousItem === null}
				onClick={selectPrevious}
				title="Previous animation item"
				renderAction={(color) => (
					<NavigationChevron
						color={previousItem === null ? disabledChevronColor : color}
						direction="left"
					/>
				)}
			/>
			<div style={itemStrip}>
				<TimelineNavigatorItem
					extendLineLeft={false}
					extendLineRight={currentItem.type === 'keyframe'}
					item={previousItem}
					onSelect={selectItem}
					selected={
						previousItem === null ? false : isSelected(previousItem.selection)
					}
				/>
				<TimelineNavigatorItem
					extendLineLeft={previousItem?.type === 'keyframe'}
					extendLineRight={nextItem?.type === 'keyframe'}
					item={currentItem}
					onSelect={selectItem}
					selected={isSelected(currentItem.selection)}
				/>
				<TimelineNavigatorItem
					extendLineLeft={currentItem.type === 'keyframe'}
					extendLineRight={false}
					item={nextItem}
					onSelect={selectItem}
					selected={nextItem === null ? false : isSelected(nextItem.selection)}
				/>
			</div>
			<InlineAction
				disabled={nextItem === null}
				onClick={selectNext}
				title="Next animation item"
				renderAction={(color) => (
					<NavigationChevron
						color={nextItem === null ? disabledChevronColor : color}
						direction="right"
					/>
				)}
			/>
		</div>
	);
};
