import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	DragOverrideValue,
	GetDragOverrides,
	InteractivitySchema,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {getKeyframeLocalFrame, getKeyframeSourceFrame} from './keyframe-frames';
import type {CanvasOutline} from './outline-geometry';
import {
	findCanvasOutlineSnap,
	type CanvasOutlineSnapPoint,
	type CanvasOutlineSnapTarget,
} from './outline-snap';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from './pointer-session';
import {parseTranslate, serializeTranslate} from './translate-value';

export const canvasTranslateFieldKey = 'style.translate';
export const canvasOutlineDragThresholdPx = 4;

export type CanvasOutlineTranslatePropStatus =
	| CanUpdateSequencePropStatusStatic
	| CanUpdateSequencePropStatusKeyframed;

/** A sequence whose `style.translate` is moved by a drag or a keyboard nudge. */
export type CanvasOutlineTranslateTarget = {
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly schema: InteractivitySchema;
	readonly fieldDefault: string | undefined;
	/**
	 * How the translate prop is written in the source. `null` when the source
	 * is unknown: the movement then starts from the runtime value and results
	 * in a static value.
	 */
	readonly propStatus: CanvasOutlineTranslatePropStatus | null;
	/** The translate prop of the mounted element, the origin when `propStatus` is null. */
	readonly runtimeValue: unknown;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
};

export type CanvasOutlineTranslateDragState<
	Target extends CanvasOutlineTranslateTarget = CanvasOutlineTranslateTarget,
> = {
	readonly defaultValue: string | null;
	readonly key: string;
	readonly sourceFrame: number;
	readonly startX: number;
	readonly startY: number;
	readonly startZ: number | null;
	readonly target: Target;
};

export type CanvasOutlineStaticDragChange = {
	readonly type: 'static';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: InteractivitySchema;
};

export type CanvasOutlineKeyframedDragChange = {
	readonly type: 'keyframed';
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly sourceFrame: number;
	readonly value: unknown;
	readonly schema: InteractivitySchema;
};

export type CanvasOutlineDragChange =
	| CanvasOutlineStaticDragChange
	| CanvasOutlineKeyframedDragChange;

export const getCanvasOutlineTranslateDragStates = <
	Target extends CanvasOutlineTranslateTarget,
>({
	dragTargets,
	getDragOverrides,
	timelinePosition,
}: {
	readonly dragTargets: readonly Target[];
	readonly getDragOverrides: GetDragOverrides;
	readonly timelinePosition: number;
}): CanvasOutlineTranslateDragState<Target>[] => {
	return dragTargets.map((target) => {
		const dragOverrideValue = (getDragOverrides(target.nodePath) ?? {})[
			canvasTranslateFieldKey
		];
		const sourceFrame = getKeyframeSourceFrame({
			displayFrame: timelinePosition,
			keyframeDisplayOffset: target.keyframeDisplayOffset,
			keyframePlaybackRate: target.keyframePlaybackRate,
			propStatus: target.propStatus,
		});
		let effectiveValue: unknown;
		if (target.propStatus === null) {
			const dragOverride = Internals.resolveDragOverrideValue({
				dragOverrideValue,
				frame: sourceFrame,
			});
			effectiveValue =
				dragOverride.type === 'resolved'
					? dragOverride.value
					: (target.runtimeValue ?? target.fieldDefault);
		} else {
			effectiveValue = Internals.getEffectiveVisualModeValue({
				propStatus: target.propStatus,
				dragOverrideValue,
				defaultValue: target.fieldDefault,
				frame: getKeyframeLocalFrame(sourceFrame, target.propStatus),
				shouldResortToDefaultValueIfUndefined: true,
			});
		}

		const [startX, startY, startZ] = parseTranslate(
			String(effectiveValue ?? '0px 0px'),
		);

		return {
			defaultValue:
				target.fieldDefault !== undefined
					? JSON.stringify(target.fieldDefault)
					: null,
			key: Internals.makeSequencePropsSubscriptionKey(target.nodePath),
			sourceFrame,
			startX,
			startY,
			startZ,
			target,
		};
	});
};

export const getCanvasOutlineTranslateDragValues = ({
	dragStates,
	deltaX,
	deltaY,
}: {
	readonly dragStates: readonly CanvasOutlineTranslateDragState[];
	readonly deltaX: number;
	readonly deltaY: number;
}): Map<string, string> => {
	return new Map(
		dragStates.map((dragState) => [
			dragState.key,
			serializeTranslate([
				dragState.startX + deltaX,
				dragState.startY + deltaY,
				dragState.startZ,
			]),
		]),
	);
};

export const applyCanvasOutlineDragAxisLock = ({
	deltaX,
	deltaY,
	axisLocked,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly axisLocked: boolean;
}) => {
	if (!axisLocked) {
		return {deltaX, deltaY};
	}

	if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		return {deltaX, deltaY: 0};
	}

	return {deltaX: 0, deltaY};
};

export const isCanvasOutlineDragPastThreshold = ({
	deltaX,
	deltaY,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
}) => {
	return Math.hypot(deltaX, deltaY) >= canvasOutlineDragThresholdPx;
};

export const getCanvasOutlineTranslateDragChanges = ({
	dragStates,
	lastValues,
}: {
	readonly dragStates: readonly CanvasOutlineTranslateDragState[];
	readonly lastValues: ReadonlyMap<string, string>;
}): CanvasOutlineDragChange[] => {
	const changes: CanvasOutlineDragChange[] = [];

	for (const dragState of dragStates) {
		const value = lastValues.get(dragState.key);
		if (value === undefined) {
			continue;
		}

		const {propStatus} = dragState.target;
		if (propStatus?.status === 'keyframed') {
			const startValue = serializeTranslate([
				dragState.startX,
				dragState.startY,
				dragState.startZ,
			]);
			if (value === startValue) {
				continue;
			}

			changes.push({
				type: 'keyframed',
				fileName: dragState.target.nodePath.absolutePath,
				nodePath: dragState.target.nodePath,
				fieldKey: canvasTranslateFieldKey,
				sourceFrame: dragState.sourceFrame,
				value,
				schema: dragState.target.schema,
			});
			continue;
		}

		const currentValue =
			propStatus === null
				? dragState.target.runtimeValue
				: propStatus.codeValue;
		const shouldSave =
			value !== currentValue &&
			!(
				dragState.defaultValue === JSON.stringify(value) &&
				currentValue === undefined
			);

		if (!shouldSave) {
			continue;
		}

		changes.push({
			type: 'static',
			fileName: dragState.target.nodePath.absolutePath,
			nodePath: dragState.target.nodePath,
			fieldKey: canvasTranslateFieldKey,
			value,
			defaultValue: dragState.defaultValue,
			schema: dragState.target.schema,
		});
	}

	return changes;
};

export const clearCanvasOutlineDragOverrides = ({
	clearDragOverrides,
	dragStates,
}: {
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly dragStates: readonly {
		readonly target: {readonly nodePath: SequencePropsSubscriptionKey};
	}[];
}) => {
	for (const dragState of dragStates) {
		clearDragOverrides(dragState.target.nodePath);
	}
};

export type CanvasOutlineNudgeDirection = 'left' | 'right' | 'up' | 'down';

export const getCanvasOutlineNudgeDirection = (
	key: string,
): CanvasOutlineNudgeDirection | null => {
	if (key === 'ArrowLeft') {
		return 'left';
	}

	if (key === 'ArrowRight') {
		return 'right';
	}

	if (key === 'ArrowUp') {
		return 'up';
	}

	if (key === 'ArrowDown') {
		return 'down';
	}

	return null;
};

export const getCanvasOutlineNudgeDelta = ({
	direction,
	shiftKey,
}: {
	readonly direction: CanvasOutlineNudgeDirection;
	readonly shiftKey: boolean;
}) => {
	const increment = shiftKey ? 10 : 1;
	return direction === 'left' || direction === 'up' ? -increment : increment;
};

export const getCanvasOutlineNudgeDeltas = ({
	deltaX,
	deltaY,
	direction,
	shiftKey,
}: {
	readonly deltaX: number;
	readonly deltaY: number;
	readonly direction: CanvasOutlineNudgeDirection;
	readonly shiftKey: boolean;
}) => {
	const delta = getCanvasOutlineNudgeDelta({direction, shiftKey});

	if (direction === 'left' || direction === 'right') {
		return {deltaX: deltaX + delta, deltaY};
	}

	return {deltaX, deltaY: deltaY + delta};
};

/** The accumulated movement of one drag or one run of keyboard nudges. */
export type CanvasOutlineTranslateSession<
	Target extends CanvasOutlineTranslateTarget = CanvasOutlineTranslateTarget,
> = {
	readonly dragStates: readonly CanvasOutlineTranslateDragState<Target>[];
	deltaX: number;
	deltaY: number;
	lastValues: ReadonlyMap<string, string>;
};

export const createCanvasOutlineTranslateSession = <
	Target extends CanvasOutlineTranslateTarget,
>(
	dragStates: readonly CanvasOutlineTranslateDragState<Target>[],
): CanvasOutlineTranslateSession<Target> => ({
	dragStates,
	deltaX: 0,
	deltaY: 0,
	lastValues: new Map(),
});

export type SetCanvasDragOverrides = (
	nodePath: SequencePropsSubscriptionKey,
	key: string,
	value: DragOverrideValue,
) => void;

/** Moves every sequence of the session and previews the values through overrides. */
export const applyCanvasOutlineTranslateDelta = ({
	session,
	deltaX,
	deltaY,
	setDragOverrides,
}: {
	readonly session: CanvasOutlineTranslateSession;
	readonly deltaX: number;
	readonly deltaY: number;
	readonly setDragOverrides: SetCanvasDragOverrides;
}) => {
	session.deltaX = deltaX;
	session.deltaY = deltaY;
	session.lastValues = getCanvasOutlineTranslateDragValues({
		dragStates: session.dragStates,
		deltaX,
		deltaY,
	});
	for (const dragState of session.dragStates) {
		const value = session.lastValues.get(dragState.key);
		if (value === undefined) {
			throw new Error('Expected drag value to be available');
		}

		const {propStatus} = dragState.target;
		setDragOverrides(
			dragState.target.nodePath,
			canvasTranslateFieldKey,
			propStatus?.status === 'keyframed'
				? Internals.makeKeyframedDragOverride({
						status: propStatus,
						frame: dragState.sourceFrame,
						value,
					})
				: Internals.makeStaticDragOverride(value),
		);
	}
};

export type CanvasOutlineTranslateDragSnapping = {
	/** The outlines being moved, in overlay pixels. */
	readonly outlines: readonly CanvasOutline[];
	readonly getTargets: () => readonly CanvasOutlineSnapTarget[];
	readonly onSnapPointsChange: (
		snapPoints: readonly CanvasOutlineSnapPoint[],
	) => void;
	/** Whether holding Command or Ctrl while dragging bypasses snapping. */
	readonly modifierDisablesSnapping: boolean;
};

export type CanvasOutlineTranslateDragEnd<
	Target extends CanvasOutlineTranslateTarget,
> = {
	/**
	 * The values that differ from the source. Empty when the pointer did not
	 * move past the drag threshold or returned to the start; the overrides
	 * are cleared in that case. Otherwise, persist the changes and clear the
	 * overrides with `clearCanvasOutlineDragOverrides()`.
	 */
	readonly changes: readonly CanvasOutlineDragChange[];
	readonly dragged: boolean;
	/** False when the gesture was cancelled, e.g. by the window losing focus. */
	readonly released: boolean;
	readonly session: CanvasOutlineTranslateSession<Target>;
};

/**
 * Moves the sequences of the drag states with the pointer. Shift locks the
 * dominant axis, the movement starts after `canvasOutlineDragThresholdPx`.
 * Returns a function that cancels the gesture.
 */
export const startCanvasOutlineTranslateDrag = <
	Target extends CanvasOutlineTranslateTarget,
>({
	event,
	captureTarget,
	dragStates,
	scale,
	snapping,
	setDragOverrides,
	clearDragOverrides,
	onDragStart,
	onDragEnd,
}: {
	readonly event: Pick<
		PointerEvent,
		'button' | 'pointerId' | 'clientX' | 'clientY' | 'metaKey' | 'ctrlKey'
	>;
	readonly captureTarget: Element;
	readonly dragStates: readonly CanvasOutlineTranslateDragState<Target>[];
	/** Overlay pixels per composition pixel. */
	readonly scale: number;
	readonly snapping: CanvasOutlineTranslateDragSnapping | null;
	readonly setDragOverrides: SetCanvasDragOverrides;
	readonly clearDragOverrides: (nodePath: SequencePropsSubscriptionKey) => void;
	readonly onDragStart: () => void;
	readonly onDragEnd: (end: CanvasOutlineTranslateDragEnd<Target>) => void;
}): (() => void) => {
	const session = createCanvasOutlineTranslateSession(dragStates);
	const startPointerX = event.clientX;
	const startPointerY = event.clientY;
	let currentPointerX = startPointerX;
	let currentPointerY = startPointerY;
	let axisLocked = false;
	let dragStarted = false;
	let snappingDisabled =
		snapping?.modifierDisablesSnapping === true &&
		(event.metaKey || event.ctrlKey);
	let snapTargets: readonly CanvasOutlineSnapTarget[] | null = null;

	const update = () => {
		const screenDeltaX = currentPointerX - startPointerX;
		const screenDeltaY = currentPointerY - startPointerY;
		if (!dragStarted) {
			if (
				!isCanvasOutlineDragPastThreshold({
					deltaX: screenDeltaX,
					deltaY: screenDeltaY,
				})
			) {
				return;
			}

			dragStarted = true;
			onDragStart();
		}

		const axisLockedDirection = axisLocked
			? Math.abs(screenDeltaX) >= Math.abs(screenDeltaY)
				? 'horizontal'
				: 'vertical'
			: null;
		let {deltaX, deltaY} = applyCanvasOutlineDragAxisLock({
			deltaX: screenDeltaX / scale,
			deltaY: screenDeltaY / scale,
			axisLocked,
		});

		if (snapping !== null && !snappingDisabled) {
			snapTargets ??= snapping.getTargets();
			const snapResult = findCanvasOutlineSnap({
				allowX: axisLockedDirection !== 'vertical',
				allowY: axisLockedDirection !== 'horizontal',
				deltaX,
				deltaY,
				outlines: snapping.outlines,
				scale,
				targets: snapTargets,
			});
			deltaX += snapResult.snapOffsetX ?? 0;
			deltaY += snapResult.snapOffsetY ?? 0;
			snapping.onSnapPointsChange(snapResult.activeSnapPoints);
		} else {
			snapping?.onSnapPointsChange([]);
		}

		applyCanvasOutlineTranslateDelta({
			session,
			deltaX,
			deltaY,
			setDragOverrides,
		});
	};

	const onKeyChange = (keyEvent: KeyboardEvent) => {
		if (keyEvent.key !== 'Shift') {
			return;
		}

		const nextAxisLocked = keyEvent.type === 'keydown';
		if (nextAxisLocked === axisLocked) {
			return;
		}

		axisLocked = nextAxisLocked;
		update();
	};

	const end = startCapturedPointerSession({
		event,
		captureTarget,
		onMove: (moveEvent) => {
			moveEvent.preventDefault();
			currentPointerX = moveEvent.clientX;
			currentPointerY = moveEvent.clientY;
			axisLocked = moveEvent.shiftKey;
			snappingDisabled =
				snapping?.modifierDisablesSnapping === true &&
				(moveEvent.metaKey || moveEvent.ctrlKey);
			update();
		},
		onEnd: (reason, endEvent) => {
			window.removeEventListener('keydown', onKeyChange);
			window.removeEventListener('keyup', onKeyChange);
			if (dragStarted) {
				snapping?.onSnapPointsChange([]);
			}

			const changes = getCanvasOutlineTranslateDragChanges({
				dragStates: session.dragStates,
				lastValues: session.lastValues,
			});
			if (changes.length === 0) {
				clearCanvasOutlineDragOverrides({
					clearDragOverrides,
					dragStates: session.dragStates,
				});
			}

			onDragEnd({
				changes,
				dragged: dragStarted,
				released: isPointerSessionRelease(reason, endEvent),
				session,
			});
		},
	});
	window.addEventListener('keydown', onKeyChange);
	window.addEventListener('keyup', onKeyChange);

	return end;
};
