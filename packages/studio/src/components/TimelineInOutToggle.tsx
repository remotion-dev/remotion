import {PlayerInternals} from '@remotion/player';
import React, {
	createRef,
	useCallback,
	useEffect,
	useImperativeHandle,
} from 'react';
import {Internals} from 'remotion';
import {BLUE} from '../helpers/colors';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {
	TimelineInPointer,
	TimelineOutPointer,
} from '../icons/timelineInOutPointer';
import type {InOutValue, TimelineInOutContextValue} from '../state/in-out';
import {
	useTimelineInOutFramePosition,
	useTimelineSetInOutFramePosition,
} from '../state/in-out';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

const style: React.CSSProperties = {
	width: 17,
	height: 17,
};

const buttonStyle: React.CSSProperties = {
	width: 18,
};

export const inOutHandles = createRef<{
	inMarkClick: (e: KeyboardEvent | null) => void;
	outMarkClick: (e: KeyboardEvent | null) => void;
	clearMarks: () => void;
}>();

export const defaultInOutValue: InOutValue = {inFrame: null, outFrame: null};

export const TimelineInOutPointToggle: React.FC = () => {
	const inShortcut = useKeyboardShortcutLabel('setInPoint');
	const outShortcut = useKeyboardShortcutLabel('setOutPoint');
	const inAriaShortcut = useKeyboardShortcutAriaKeyShortcuts('setInPoint');
	const outAriaShortcut = useKeyboardShortcutAriaKeyShortcuts('setOutPoint');
	const shortcutsDisabled = areKeyboardShortcutsDisabled();
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setInAndOutFrames} = useTimelineSetInOutFramePosition();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const keybindings = useKeybinding();
	const {getCurrentFrame} = PlayerInternals.usePlayerMethods();
	const timelinePosition = Internals.Timeline.useTimelinePosition();
	const isFirstFrame = timelinePosition === 0;
	const isLastFrame =
		timelinePosition === (videoConfig?.durationInFrames ?? 1) - 1;

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
			event: 'keydown',
			action: 'setInPoint',
			callback: (e) => {
				onInMark(e);
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const oKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'setOutPoint',
			callback: (e) => {
				onOutMark(e);
			},
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		const xKey = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'clearInOutPoints',
			callback: () => {
				onInOutClear(confId);
			},
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
			<ActionTooltip
				label="In point"
				shortcut={shortcutsDisabled ? null : inShortcut}
				delay={800}
				dismissOnClick
			>
				<ControlButton
					title=""
					aria-label="In point"
					aria-description="Right click to clear"
					aria-keyshortcuts={
						shortcutsDisabled ? undefined : inAriaShortcut || undefined
					}
					style={buttonStyle}
					onClick={onInMark}
					onContextMenu={clearInMark}
					disabled={!videoConfig || isFirstFrame}
				>
					{(color) => (
						<TimelineInPointer
							color={inFrame === null ? color : BLUE}
							style={style}
						/>
					)}
				</ControlButton>
			</ActionTooltip>
			<ActionTooltip
				label="Out point"
				shortcut={shortcutsDisabled ? null : outShortcut}
				delay={800}
				dismissOnClick
			>
				<ControlButton
					title=""
					aria-label="Out point"
					aria-description="Right click to clear"
					aria-keyshortcuts={
						shortcutsDisabled ? undefined : outAriaShortcut || undefined
					}
					style={buttonStyle}
					onClick={onOutMark}
					onContextMenu={clearOutMark}
					disabled={!videoConfig || isLastFrame}
				>
					{(color) => (
						<TimelineOutPointer
							color={outFrame === null ? color : BLUE}
							style={style}
						/>
					)}
				</ControlButton>
			</ActionTooltip>
		</>
	);
};
