import {
	CanvasInternals,
	type CanvasOutlineNudgeDirection,
} from '@remotion/canvas';
import {PlayerInternals} from '@remotion/player';
import type React from 'react';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {
	SelectedOutlineDragTarget,
	SelectedOutlineKeyboardNudgeSession,
} from './selected-outline-types';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';

const {
	applyCanvasOutlineTranslateDelta,
	createCanvasOutlineTranslateSession,
	getCanvasOutlineNudgeDeltas,
	getCanvasOutlineNudgeDirection,
	getCanvasOutlineTranslateDragChanges,
	getCanvasOutlineTranslateDragStates,
} = CanvasInternals;

export const SelectedOutlineKeyboardControls: React.FC<{
	readonly getAllDragTargets: () => readonly SelectedOutlineDragTarget[];
}> = ({getAllDragTargets}) => {
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses, setDragOverrides, clearDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const {frameBack, frameForward, getCurrentFrame, seek} =
		PlayerInternals.usePlayerMethods();
	const keybindings = useKeybinding();
	const keyboardNudgeSessionRef =
		useRef<SelectedOutlineKeyboardNudgeSession | null>(null);
	const saveKeyboardNudgeSessionRef = useRef<() => void>(() => undefined);

	const saveKeyboardNudgeSession = useCallback(() => {
		const session = keyboardNudgeSessionRef.current;
		if (session === null) {
			return;
		}

		keyboardNudgeSessionRef.current = null;
		const changes = getCanvasOutlineTranslateDragChanges({
			dragStates: session.dragStates,
			lastValues: session.lastValues,
		});

		if (changes.length === 0) {
			clearSelectedOutlineDragOverrides({
				clearDragOverrides,
				dragStates: session.dragStates,
			});
			return;
		}

		const [
			{
				target: {clientId},
			},
		] = session.dragStates;
		const staticChanges = changes.filter(
			(change): change is SelectedOutlineStaticDragChange =>
				change.type === 'static',
		);
		const keyframedChanges = changes.filter(
			(change): change is SelectedOutlineKeyframedDragChange =>
				change.type === 'keyframed',
		);

		Promise.all([
			staticChanges.length > 0
				? saveSequenceProps({
						changes: staticChanges,
						addedKeyframes: null,
						movedKeyframes: null,
						setPropStatuses,
						clientId,
						undoLabel:
							changes.length > 1 ? 'Move selected sequences' : 'Move sequence',
						redoLabel:
							changes.length > 1
								? 'Move selected sequences back'
								: 'Move sequence back',
					})
				: Promise.resolve(),
			callAddKeyframes({
				sequenceKeyframes: keyframedChanges,
				effectKeyframes: [],
				setPropStatuses,
				clientId,
			}),
		])
			.catch((err) => {
				showNotification(
					`Could not save sequence props: ${
						err instanceof Error ? err.message : String(err)
					}`,
					4000,
				);
			})
			.finally(() => {
				clearSelectedOutlineDragOverrides({
					clearDragOverrides,
					dragStates: session.dragStates,
				});
			});
	}, [clearDragOverrides, setPropStatuses]);

	useEffect(() => {
		saveKeyboardNudgeSessionRef.current = saveKeyboardNudgeSession;
	}, [saveKeyboardNudgeSession]);

	useEffect(() => {
		return () => {
			saveKeyboardNudgeSessionRef.current();
		};
	}, []);

	const seekWithArrowKey = useCallback(
		(event: KeyboardEvent, direction: CanvasOutlineNudgeDirection) => {
			if (direction === 'up' || direction === 'down') {
				return;
			}

			event.preventDefault();

			if (direction === 'left') {
				if (event.altKey) {
					seek(0);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: 0,
					});
				} else if (event.shiftKey) {
					frameBack(getCurrentFps());
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - getCurrentFps()),
					});
				} else {
					frameBack(1);
					ensureFrameIsInViewport({
						direction: 'fit-left',
						durationInFrames: getCurrentDuration(),
						frame: Math.max(0, getCurrentFrame() - 1),
					});
				}

				return;
			}

			if (event.altKey) {
				seek(getCurrentDuration() - 1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration() - 1,
					frame: getCurrentDuration() - 1,
				});
			} else if (event.shiftKey) {
				frameForward(getCurrentFps());
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(
						getCurrentDuration() - 1,
						getCurrentFrame() + getCurrentFps(),
					),
				});
			} else {
				frameForward(1);
				ensureFrameIsInViewport({
					direction: 'fit-right',
					durationInFrames: getCurrentDuration(),
					frame: Math.min(getCurrentDuration() - 1, getCurrentFrame() + 1),
				});
			}
		},
		[frameBack, frameForward, getCurrentFrame, seek],
	);

	const onArrowKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const direction = getCanvasOutlineNudgeDirection(event.key);

			if (direction === null) {
				return;
			}

			const allDragTargets = getAllDragTargets();

			if (allDragTargets.length === 0) {
				seekWithArrowKey(event, direction);
				return;
			}

			if (event.altKey) {
				seekWithArrowKey(event, direction);
				return;
			}

			event.preventDefault();

			const activeSession =
				keyboardNudgeSessionRef.current ??
				createCanvasOutlineTranslateSession(
					getCanvasOutlineTranslateDragStates({
						dragTargets: allDragTargets,
						getDragOverrides,
						timelinePosition: getCurrentFrame(),
					}),
				);

			keyboardNudgeSessionRef.current = activeSession;
			applyCanvasOutlineTranslateDelta({
				session: activeSession,
				...getCanvasOutlineNudgeDeltas({
					deltaX: activeSession.deltaX,
					deltaY: activeSession.deltaY,
					direction,
					shiftKey: event.shiftKey,
				}),
				setDragOverrides,
			});
		},
		[
			getAllDragTargets,
			getCurrentFrame,
			getDragOverrides,
			seekWithArrowKey,
			setDragOverrides,
		],
	);

	const onArrowKeyUp = useCallback(
		(event: KeyboardEvent) => {
			const direction = getCanvasOutlineNudgeDirection(event.key);

			if (direction === null || keyboardNudgeSessionRef.current === null) {
				return;
			}

			event.preventDefault();
			saveKeyboardNudgeSession();
		},
		[saveKeyboardNudgeSession],
	);

	useEffect(() => {
		const keyDownBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keydown',
				key,
				callback: onArrowKeyDown,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);
		const keyUpBindings = (
			['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const
		).map((key) =>
			keybindings.registerKeybinding({
				event: 'keyup',
				key,
				callback: onArrowKeyUp,
				commandCtrlKey: false,
				preventDefault: false,
				triggerIfInputFieldFocused: false,
				keepRegisteredWhenNotHighestContext: false,
			}),
		);

		return () => {
			for (const binding of [...keyDownBindings, ...keyUpBindings]) {
				binding.unregister();
			}
		};
	}, [keybindings, onArrowKeyDown, onArrowKeyUp]);

	return null;
};
