import React, {
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
} from 'react';
import {Internals} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import {ControlButton} from './ControlButton';

const getTooltipText = (pointType: string) => `Mark ${pointType}`;

const style: React.CSSProperties = {
	width: 16,
	height: 16,
};

export const inOutHandles = createRef<{
	inMarkClick: () => void;
	outMarkClick: () => void;
	clearMarks: () => void;
}>();

export const TimelineInOutPointToggle: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {
		inFrame,
		outFrame,
	} = Internals.Timeline.useTimelineInOutFramePosition();
	const {
		setInAndOutFrames,
	} = Internals.Timeline.useTimelineSetInOutFramePosition();
	const isStill = useIsStill();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();

	const onInMark = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		setInAndOutFrames((prev) => {
			const biggestPossible =
				prev.outFrame === null ? Infinity : prev.outFrame - 1;
			const selected = Math.min(timelinePosition, biggestPossible);

			if (selected === 0) {
				return {
					...prev,
					inFrame: null,
				};
			}

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

	const onOutMark = useCallback(() => {
		if (!videoConfig) {
			return null;
		}

		setInAndOutFrames((prev) => {
			const smallestPossible =
				prev.inFrame === null ? -Infinity : prev.inFrame + 1;
			const selected = Math.max(timelinePosition, smallestPossible);

			if (selected === videoConfig.durationInFrames - 1) {
				return {
					...prev,
					outFrame: null,
				};
			}

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

	const onInOutClear = useCallback(() => {
		setInAndOutFrames(() => {
			return {
				inFrame: null,
				outFrame: null,
			};
		});
	}, [setInAndOutFrames]);

	useEffect(() => {
		const iKey = keybindings.registerKeybinding('keypress', 'i', () => {
			onInMark();
		});
		const oKey = keybindings.registerKeybinding('keypress', 'o', () => {
			onOutMark();
		});
		const xKey = keybindings.registerKeybinding('keypress', 'x', () => {
			onInOutClear();
		});
		return () => {
			oKey.unregister();
			iKey.unregister();
			xKey.unregister();
		};
	}, [keybindings, onInMark, onInOutClear, onOutMark]);

	useImperativeHandle(inOutHandles, () => {
		return {
			clearMarks: onInOutClear,
			inMarkClick: onInMark,
			outMarkClick: onOutMark,
		};
	});

	if (!videoConfig) {
		return null;
	}

	if (isStill) {
		return null;
	}

	return (
		<>
			<ControlButton
				title={getTooltipText('In (I)')}
				aria-label={getTooltipText('In (I)')}
				onClick={onInMark}
				disabled={timelinePosition === 0}
			>
				<TimelineInPointer
					color={inFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
			<ControlButton
				title={getTooltipText('Out (O)')}
				aria-label={getTooltipText('Out (O)')}
				onClick={onOutMark}
				disabled={timelinePosition === videoConfig.durationInFrames - 1}
			>
				<TimelineOutPointer
					color={outFrame === null ? 'white' : 'var(--blue)'}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
