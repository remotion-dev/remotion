import {PlayerInternals} from '@remotion/player';
import React, {
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {BLUE} from '../helpers/colors';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import type {InOutValue, TimelineInOutContextValue} from '../state/in-out';
import {
	useTimelineInOutFramePosition,
	useTimelineSetInOutFramePosition,
} from '../state/in-out';
import {ControlButton} from './ControlButton';

const getTooltipText = (pointType: string, key: string) =>
	[
		`Mark ${pointType}`,
		areKeyboardShortcutsDisabled() ? null : `(${key})`,
		'- right click to clear',
	]
		.filter(NoReactInternals.truthy)
		.join(' ');

const style: React.CSSProperties = {
	width: 16,
	height: 16,
};

export const inOutHandles = createRef<{
	inMarkClick: (e: KeyboardEvent | null) => void;
	outMarkClick: (e: KeyboardEvent | null) => void;
	clearMarks: () => void;
}>();

export const defaultInOutValue: InOutValue = {inFrame: null, outFrame: null};

export const TimelineInOutPointToggle: React.FC = () => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setInAndOutFrames} = useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();
	const {getCurrentFrame, isFirstFrame, isLastFrame} =
		PlayerInternals.usePlayer();

	const onInOutClear = useCallback(
		(composition: string) => {
			setInAndOutFrames((prev) => {
				return {
					...prev,
					[composition]: {
						inFrame: null,
						outFrame: null,
					},
				};
			});
		},
		[setInAndOutFrames],
	);

	const onInMark = useCallback(
		(e: KeyboardEvent | React.MouseEvent | null) => {
			if (!videoConfig) {
				return null;
			}

			if (e?.shiftKey) {
				setInAndOutFrames((prev) => {
					return {
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							inFrame: null,
						},
					};
				});
				return null;
			}

			setInAndOutFrames((prev): TimelineInOutContextValue => {
				const prevOut = prev[videoConfig.id]?.outFrame;
				const biggestPossible =
					prevOut === undefined || prevOut === null ? Infinity : prevOut - 1;
				const selected = Math.min(getCurrentFrame(), biggestPossible);

				if (selected === 0) {
					return {
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							inFrame: null,
						},
					};
				}

				const prevIn = prev[videoConfig.id]?.inFrame;
				if (prevIn !== null && prevIn !== undefined) {
					// Disable if already at this position
					if (prevIn === selected) {
						return {
							...prev,
							[videoConfig.id]: {
								...(prev[videoConfig.id] ?? defaultInOutValue),
								inFrame: null,
							},
						};
					}
				}

				return {
					...prev,
					[videoConfig.id]: {
						...(prev[videoConfig.id] ?? defaultInOutValue),
						inFrame: selected,
					},
				};
			});
		},
		[getCurrentFrame, setInAndOutFrames, videoConfig],
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
					[videoConfig.id]: {
						...(f[videoConfig.id] ?? defaultInOutValue),
						inFrame: null,
					},
				};
			});
		},
		[setInAndOutFrames, videoConfig],
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
					[videoConfig.id]: {
						...(f[videoConfig.id] ?? defaultInOutValue),
						outFrame: null,
					},
				};
			});
		},
		[setInAndOutFrames, videoConfig],
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
						[videoConfig.id]: {
							...(f[videoConfig.id] ?? defaultInOutValue),
							outFrame: null,
						},
					};
				});
				return;
			}

			setInAndOutFrames((prev) => {
				const prevInFrame = prev[videoConfig.id]?.inFrame;
				const smallestPossible =
					prevInFrame === null || prevInFrame === undefined
						? -Infinity
						: prevInFrame + 1;
				const selected = Math.max(getCurrentFrame(), smallestPossible);

				if (selected === videoConfig.durationInFrames - 1) {
					return {
						...prev,
						[videoConfig.id]: {
							...(prev[videoConfig.id] ?? defaultInOutValue),
							outFrame: null,
						},
					};
				}

				const prevOut = prev[videoConfig.id]?.outFrame;

				if (prevOut !== null && prevOut !== undefined) {
					if (prevOut === selected) {
						return {
							...prev,
							[videoConfig.id]: {
								...(prev[videoConfig.id] ?? defaultInOutValue),
								outFrame: null,
							},
						};
					}
				}

				return {
					...prev,
					[videoConfig.id]: {
						...(prev[videoConfig.id] ?? defaultInOutValue),
						outFrame: selected,
					},
				};
			});
		},
		[getCurrentFrame, setInAndOutFrames, videoConfig],
	);

	const confId = videoConfig?.id;

	useEffect(() => {
		if (!confId) {
			return;
		}

		const iKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'i',
			callback: (e) => {
				onInMark(e);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
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
			keepRegisteredWhenNotHighestContext: false,
		});
		const xKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'x',
			callback: () => {
				onInOutClear(confId);
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			oKey.unregister();
			iKey.unregister();
			xKey.unregister();
		};
	}, [confId, keybindings, onInMark, onInOutClear, onOutMark]);

	useImperativeHandle(inOutHandles, () => {
		return {
			clearMarks: () => {
				if (!confId) {
					return;
				}

				onInOutClear(confId);
			},
			inMarkClick: onInMark,
			outMarkClick: onOutMark,
		};
	}, [confId, onInMark, onInOutClear, onOutMark]);

	return (
		<>
			<ControlButton
				title={getTooltipText('In', 'I')}
				aria-label={getTooltipText('In', 'I')}
				onClick={onInMark}
				onContextMenu={clearInMark}
				disabled={!videoConfig || isFirstFrame}
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
				disabled={!videoConfig || isLastFrame}
			>
				<TimelineOutPointer
					color={outFrame === null ? 'white' : BLUE}
					style={style}
				/>
			</ControlButton>
		</>
	);
};
