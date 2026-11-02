import {PlayerInternals} from '@remotion/player';
import {CanvasInternals, type CanvasOutlineNudgeDirection} from '@remotion/sdk';
import type React from 'react';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {createCanvasDragPreview} from './canvas-drag-preview';
import {showNotification} from './Notifications/NotificationCenter';
import {
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import type {
	SelectedOutlineDragTarget,
	SelectedOutlineKeyboardNudgeSession,
} from './selected-outline-types';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequencePropsWithResult} from './Timeline/save-sequence-prop';
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
	const dragOverridesRef = useContext(
		Internals.VisualModeDragOverridesRefContext,
	);
	const {setPropStatuses, updateDragOverrides} = useContext(
		Internals.VisualModeSettersContext,
	);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const previewRef = useRef<ReturnType<typeof createCanvasDragPreview> | null>(
		null,
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
		const preview = previewRef.current;
		previewRef.current = null;
		if (preview === null) return;
		const changes = getCanvasOutlineTranslateDragChanges({
			dragStates: session.dragStates,
			lastValues: session.lastValues,
		});

		if (changes.length === 0) {
			preview.cancel();
			return;
		}

		const [
			{
				target: {clientId},
			},
		] = session.dragStates;
		const currentChanges = changes.flatMap((change) => {
			const nodePath = preview.getNodePath(change.nodePath);
			return nodePath === null ? [] : [{...change, nodePath}];
		});
		if (currentChanges.length !== changes.length) {
			preview.cancel();
			return;
		}

		const staticChanges = currentChanges.filter(
			(change): change is SelectedOutlineStaticDragChange =>
				change.type === 'static',
		);
		const keyframedChanges = currentChanges.filter(
			(change): change is SelectedOutlineKeyframedDragChange =>
				change.type === 'keyframed',
		);

		saveSequencePropsWithResult({
			changes: staticChanges,
			addedKeyframes: keyframedChanges,
			movedKeyframes: null,
			setPropStatuses: preview.setPropStatuses,
			clientId,
			undoLabel:
				changes.length > 1 ? 'Move selected sequences' : 'Move sequence',
			redoLabel:
				changes.length > 1
					? 'Move selected sequences back'
					: 'Move sequence back',
		})
			.then((response) => {
				if (response && !response.canUpdate)
					throw new Error(
						'The layer could not be updated. Try the edit again.',
					);
				preview.acknowledge(response);
			})
			.catch((err) => {
				preview.fail();
				showNotification(
					`Could not save sequence props: ${
						err instanceof Error ? err.message : String(err)
					}`,
					4000,
				);
			});
	}, []);

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
						getDragOverrides: dragOverridesRef.current.getDragOverrides,
						timelinePosition: getCurrentFrame(),
					}),
				);

			keyboardNudgeSessionRef.current = activeSession;
			const preview =
				previewRef.current ??
				createCanvasDragPreview({
					updateDragOverrides,
					setPropStatuses,
					setPropStatusesBatch: null,
					getPropStatuses: (nodePath) =>
						propStatusesRef.current[
							Internals.makeSequencePropsSubscriptionKey(nodePath)
						],
				});
			previewRef.current = preview;
			applyCanvasOutlineTranslateDelta({
				session: activeSession,
				...getCanvasOutlineNudgeDeltas({
					deltaX: activeSession.deltaX,
					deltaY: activeSession.deltaY,
					direction,
					shiftKey: event.shiftKey,
				}),
				setDragOverrides: preview.setDragOverrides,
			});
		},
		[
			getAllDragTargets,
			getCurrentFrame,
			dragOverridesRef,
			seekWithArrowKey,
			updateDragOverrides,
			setPropStatuses,
			propStatusesRef,
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
