import React, {useCallback, useEffect} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import {ControlButton} from './ControlButton';

const MIN_FRAMES_BETWEEN_POINTS = 1;
const getTooltipText = (pointType: string) => `Mark ${pointType}`;

const style: React.CSSProperties = {
	width: 16,
	height: 16,
};

export const TimelineInOutPointToggle: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();
	const {
		setInAndOutFrames,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();

	const onInFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		setInAndOutFrames((prev) => {
			const biggestPossible =
				prev.outFrame === null ? Infinity : prev.outFrame - 1;
			const selected = Math.min(timelinePosition, biggestPossible);
			if (prev.inFrame !== null) {
				// Disable if already at this position
				if (prev.inFrame === selected) {
					return {
						...prev,
						inFrame: null,
					};
				}
			}

			return {
				...prev,
				inFrame: selected,
			};
		});
	}, [setInAndOutFrames, timelinePosition, videoConfig]);

	const onOutFrameBtnClick = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		setInAndOutFrames((prev) => {
			const smallestPossible =
				prev.inFrame === null ? -Infinity : prev.inFrame + 1;
			const selected = Math.max(timelinePosition, smallestPossible);

			if (prev.outFrame !== null) {
				if (prev.outFrame === selected) {
					return {
						...prev,
						outFrame: null,
					};
				}
			}

			return {
				...prev,
				outFrame: selected,
			};
		});
	}, [setInAndOutFrames, timelinePosition, videoConfig]);

	useEffect(() => {
		const iKey = keybindings.registerKeybinding('keypress', 'i', () => {
			onInFrameBtnClick();
		});
		const oKey = keybindings.registerKeybinding('keypress', 'o', () => {
			onOutFrameBtnClick();
		});
		return () => {
			oKey.unregister();
			iKey.unregister();
		};
	}, [keybindings, onInFrameBtnClick, onOutFrameBtnClick]);

	return (
		<>
			<ControlButton
				title={getTooltipText('In')}
				aria-label={getTooltipText('In')}
				onClick={onInFrameBtnClick}
			>
				<TimelineInPointer
					color={inFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
			<ControlButton
				title={getTooltipText('Out')}
				aria-label={getTooltipText('Out')}
				onClick={onOutFrameBtnClick}
			>
				<TimelineOutPointer
					color={outFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
