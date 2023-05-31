import React, {
	createRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
} from 'react';
import {Internals} from 'remotion';
import {truthy} from '../../truthy';
import {BLUE} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import {
	useTimelineInOutFramePosition,
	useTimelineSetInOutFramePosition,
} from '../state/in-out';
import {persistMarks} from '../state/marks';
import {ControlButton} from './ControlButton';

const getTooltipText = (pointType: string, key: string) =>
	[
		`Mark ${pointType}`,
		areKeyboardShortcutsDisabled() ? null : `(${key})`,
		'- right click to clear',
	]
		.filter(truthy)
		.join(' ');

const style: React.CSSProperties = {
	width: 16,
	height: 16,
};

export const inOutHandles = createRef<{
	inMarkClick: (e: KeyboardEvent | null) => void;
	outMarkClick: (e: KeyboardEvent | null) => void;
	clearMarks: () => void;
	setMarks: (marks: [number | null, number | null]) => void;
}>();

export const TimelineInOutPointToggle: React.FC = () => {
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setInAndOutFrames} = useTimelineSetInOutFramePosition();
	const {currentComposition} = useContext(Internals.CompositionManager);
	const isStill = useIsStill();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();

	const onInOutClear = useCallback(() => {
		setInAndOutFrames(() => {
			return {
				inFrame: null,
				outFrame: null,
			};
		});
	}, [setInAndOutFrames]);

	const onInMark = useCallback(
		(e: KeyboardEvent | React.MouseEvent | null) => {
			if (!videoConfig) {
				return null;
			}

			if (e?.shiftKey) {
				setInAndOutFrames((f) => {
					return {
						...f,
						inFrame: null,
					};
				});
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
		},
		[setInAndOutFrames, timelinePosition, videoConfig]
	);

	const clearInMark = useCallback(
		(e: React.MouseEvent) => {
			if (!videoConfig) {
				return null;
			}

			e.preventDefault();

			setInAndOutFrames((f) => {
				return {
					...f,
					inFrame: null,
				};
			});
		},
		[setInAndOutFrames, videoConfig]
	);

	const clearOutMark = useCallback(
		(e: React.MouseEvent | null) => {
			if (!videoConfig) {
				return null;
			}

			e?.preventDefault();

			setInAndOutFrames((f) => {
				return {
					...f,
					outFrame: null,
				};
			});
		},
		[setInAndOutFrames, videoConfig]
	);

	const onOutMark = useCallback(
		(e: KeyboardEvent | React.MouseEvent | null) => {
			if (!videoConfig) {
				return null;
			}

			if (e?.shiftKey) {
				setInAndOutFrames((f) => {
					return {
						...f,
						outFrame: null,
					};
				});
				return;
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
		},
		[setInAndOutFrames, timelinePosition, videoConfig]
	);

	useEffect(() => {
		const iKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'i',
			callback: (e) => {
				onInMark(e);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const oKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'o',
			callback: (e) => {
				onOutMark(e);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		const xKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'x',
			callback: () => {
				onInOutClear();
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
		return () => {
			oKey.unregister();
			iKey.unregister();
			xKey.unregister();
		};
	}, [keybindings, onInMark, onInOutClear, onOutMark]);

	useEffect(() => {
		if (!currentComposition || !videoConfig) {
			return;
		}

		persistMarks(currentComposition, videoConfig.durationInFrames, [
			inFrame,
			outFrame,
		]);
	}, [currentComposition, inFrame, outFrame, videoConfig]);

	// If duration changes and it goes out of range, we reset
	useEffect(() => {
		if (outFrame === null) {
			return;
		}

		if (!videoConfig) {
			return;
		}

		if (outFrame >= videoConfig.durationInFrames - 1) {
			onInOutClear();
		}
	}, [onInOutClear, outFrame, videoConfig]);

	useEffect(() => {
		if (inFrame === null) {
			return;
		}

		if (!videoConfig) {
			return;
		}

		if (inFrame >= videoConfig.durationInFrames - 1) {
			onInOutClear();
		}
	}, [onInOutClear, inFrame, videoConfig]);

	useImperativeHandle(
		inOutHandles,
		() => {
			return {
				clearMarks: onInOutClear,
				inMarkClick: onInMark,
				outMarkClick: onOutMark,
				setMarks: ([newInFrame, newOutFrame]) => {
					setInAndOutFrames({
						inFrame: newInFrame,
						outFrame: newOutFrame,
					});
				},
			};
		},
		[onInMark, onInOutClear, onOutMark, setInAndOutFrames]
	);

	if (isStill) {
		return null;
	}

	return (
		<>
			<ControlButton
				title={getTooltipText('In', 'I')}
				aria-label={getTooltipText('In', 'I')}
				onClick={(e) => onInMark(e)}
				onContextMenu={clearInMark}
				disabled={!videoConfig || timelinePosition === 0}
			>
				<TimelineInPointer
					color={inFrame === null ? 'white' : BLUE}
					style={style}
				/>
			</ControlButton>
			<ControlButton
				title={getTooltipText('Out', 'O')}
				aria-label={getTooltipText('Out', 'O')}
				onClick={onOutMark}
				onContextMenu={clearOutMark}
				disabled={
					!videoConfig || timelinePosition === videoConfig.durationInFrames - 1
				}
			>
				<TimelineOutPointer
					color={outFrame === null ? 'white' : BLUE}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
