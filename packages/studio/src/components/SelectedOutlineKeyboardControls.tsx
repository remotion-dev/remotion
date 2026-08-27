import type {CanvasSelectableOutline} from '@remotion/canvas';
import {PlayerInternals} from '@remotion/player';
import type React from 'react';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';
import {showNotification} from './Notifications/NotificationCenter';
import {
	clearSelectedOutlineDragOverrides,
	getSelectedOutlineDragChanges,
	getSelectedOutlineDragStates,
	getSelectedOutlineDragValues,
	getSelectedOutlineKeyboardNudgeDeltas,
	getSelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyboardNudgeDirection,
	type SelectedOutlineKeyframedDragChange,
	type SelectedOutlineStaticDragChange,
} from './selected-outline-drag';
import {
	getSelectedSequenceKeys,
	getSequenceKeysContainingSelection,
} from './selected-outline-measurement';
import {
	translateFieldKey,
	type SelectedOutlineKeyboardNudgeSession,
	type SelectedOutlineTarget,
} from './selected-outline-types';
import {callAddKeyframes} from './Timeline/call-add-keyframe';
import {getCurrentDuration, getCurrentFps} from './Timeline/imperative-state';
import {saveSequenceProps} from './Timeline/save-sequence-prop';
import {ensureFrameIsInViewport} from './Timeline/timeline-scroll-logic';
import {useCurrentTimelineSelectionStateAsRef} from './Timeline/TimelineSelection';

export const SelectedOutlineKeyboardControls: React.FC<{
	readonly getLatestOutlineTargetByKey: (
		key: string,
	) => SelectedOutlineTarget | undefined;
	readonly getSelectableOutlines: () => readonly CanvasSelectableOutline[];
}> = ({getLatestOutlineTargetByKey, getSelectableOutlines}) => {
	const currentSelection = useCurrentTimelineSelectionStateAsRef();
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
		const changes = getSelectedOutlineDragChanges({
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
						clientId: session.clientId,
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
				clientId: session.clientId,
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
		(
			event: KeyboardEvent,
			direction: SelectedOutlineKeyboardNudgeDirection,
		) => {
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
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

			if (direction === null) {
				return;
			}

			const {selectedItems} = currentSelection.current;
			const selectedSequenceKeys = getSelectedSequenceKeys(selectedItems);
			const sequenceKeysContainingSelection =
				getSequenceKeysContainingSelection(selectedItems);
			const selectableOutlines = getSelectableOutlines();
			const allDragTargets = selectableOutlines.flatMap(({key}) => {
				if (
					!selectedSequenceKeys.has(key) &&
					!sequenceKeysContainingSelection.has(key)
				) {
					return [];
				}

				const drag = getLatestOutlineTargetByKey(key)?.drag ?? null;
				return drag === null ? [] : [drag];
			});

			if (selectedItems.length === 0 || allDragTargets.length === 0) {
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
				((): SelectedOutlineKeyboardNudgeSession => {
					const [firstDragTarget] = allDragTargets;
					if (firstDragTarget === undefined) {
						throw new Error('Expected a drag target');
					}

					return {
						clientId: firstDragTarget.clientId,
						deltaX: 0,
						deltaY: 0,
						dragStates: getSelectedOutlineDragStates({
							dragTargets: allDragTargets,
							getDragOverrides,
							timelinePosition: getCurrentFrame(),
						}),
						lastValues: new Map(),
					};
				})();

			keyboardNudgeSessionRef.current = activeSession;
			const nextDeltas = getSelectedOutlineKeyboardNudgeDeltas({
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
				direction,
				shiftKey: event.shiftKey,
			});
			activeSession.deltaX = nextDeltas.deltaX;
			activeSession.deltaY = nextDeltas.deltaY;

			const lastValues = getSelectedOutlineDragValues({
				dragStates: activeSession.dragStates,
				deltaX: activeSession.deltaX,
				deltaY: activeSession.deltaY,
			});
			activeSession.lastValues = lastValues;

			for (const dragState of activeSession.dragStates) {
				const value = lastValues.get(dragState.key);
				if (value === undefined) {
					throw new Error('Expected drag value to be available');
				}

				if (dragState.target.propStatus.status === 'keyframed') {
					setDragOverrides(
						dragState.target.nodePath,
						translateFieldKey,
						Internals.makeKeyframedDragOverride({
							status: dragState.target.propStatus,
							frame: dragState.sourceFrame,
							value,
						}),
					);
				} else {
					setDragOverrides(
						dragState.target.nodePath,
						translateFieldKey,
						Internals.makeStaticDragOverride(value),
					);
				}
			}
		},
		[
			currentSelection,
			getCurrentFrame,
			getDragOverrides,
			getLatestOutlineTargetByKey,
			getSelectableOutlines,
			seekWithArrowKey,
			setDragOverrides,
		],
	);

	const onArrowKeyUp = useCallback(
		(event: KeyboardEvent) => {
			const direction = getSelectedOutlineKeyboardNudgeDirection(event.key);

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
