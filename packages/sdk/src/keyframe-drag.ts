import type {
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import type {CanvasOverridesController} from './canvas-controller';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import {
	canMoveCanvasKeyframes,
	getBoundedKeyframeDragDelta,
	getCanvasKeyframeMove,
	getMovedCanvasKeyframeOverride,
	type CanvasKeyframeMoveTarget,
} from './keyframe-move';
import type {CanvasKeyframeChange, CanvasKeyframeTrack} from './keyframes';
import {getCanvasKeyframeSourceFrame} from './keyframes';
import {
	isPointerSessionRelease,
	startCapturedPointerSession,
} from './pointer-session';

export const canvasKeyframeDragThresholdPx = 3;

/** A keyframe that a timeline drag moves. */
export type CanvasKeyframeDragTarget = {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly track: CanvasKeyframeTrack;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	/** The keyframe in composition frames. */
	readonly frame: number;
};

export type CanvasKeyframeDragEnd = {
	/**
	 * One move per prop whose keyframes changed position. Empty when the
	 * pointer did not move past the drag threshold, returned to the start,
	 * or the move cannot be applied; the overrides are cleared in that case.
	 * Otherwise, persist the changes and clear the overrides of every
	 * `nodePathInfo` afterwards.
	 */
	readonly changes: readonly CanvasKeyframeChange[];
	/** How far the keyframes moved, in composition frames. */
	readonly delta: number;
	readonly dragged: boolean;
	/** False when the gesture was cancelled, e.g. by the window losing focus. */
	readonly released: boolean;
};

type DragGroup = {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly targets: CanvasKeyframeMoveTarget[];
};

const groupCanvasKeyframeDragTargets = (
	targets: readonly CanvasKeyframeDragTarget[],
): DragGroup[] => {
	const groups = new Map<string, DragGroup>();
	for (const target of targets) {
		const sourceFrame = getCanvasKeyframeSourceFrame({
			track: target.track,
			propStatus: target.propStatus,
			frame: target.frame,
		});
		if (
			!target.propStatus.keyframes.some(
				(keyframe) => keyframe.frame === sourceFrame,
			)
		) {
			continue;
		}

		const groupKey = `${Internals.makeSequencePropsSubscriptionKey(
			target.nodePathInfo.sequenceSubscriptionKey,
		)}\0${target.key}`;
		const group = groups.get(groupKey) ?? {
			nodePathInfo: target.nodePathInfo,
			schema: target.schema,
			key: target.key,
			targets: [],
		};
		groups.set(groupKey, group);
		group.targets.push({
			propStatus: target.propStatus,
			displayFrame: target.frame,
			sourceFrame,
			keyframePlaybackRate: target.track.keyframePlaybackRate,
		});
	}

	return [...groups.values()];
};

/**
 * Moves keyframes along the timeline with the pointer. The moved positions
 * are previewed through `overrides` and reported once the pointer is
 * released. Returns a function that cancels the gesture.
 */
export const startCanvasKeyframeDrag = ({
	event,
	captureTarget,
	targets,
	pixelsPerFrame,
	durationInFrames,
	overrides,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	readonly event: Pick<PointerEvent, 'button' | 'pointerId' | 'clientX'>;
	readonly captureTarget: Element;
	readonly targets: readonly CanvasKeyframeDragTarget[];
	/** The width of one composition frame on the timeline. */
	readonly pixelsPerFrame: number;
	readonly durationInFrames: number;
	readonly overrides: CanvasOverridesController;
	readonly onDragStart: (() => void) | null;
	/** Called with the previewed movement in composition frames whenever it changes. */
	readonly onDragMove: ((delta: number) => void) | null;
	readonly onDragEnd: (end: CanvasKeyframeDragEnd) => void;
}): (() => void) => {
	const groups = groupCanvasKeyframeDragTargets(targets);
	const moveTargets = groups.flatMap((group) => group.targets);
	const startClientX = event.clientX;
	let dragged = false;
	let lastDelta = 0;
	let previewed = false;

	const clearOverrides = () => {
		if (!previewed) {
			return;
		}

		previewed = false;
		for (const group of groups) {
			overrides.clear(group.nodePathInfo);
		}
	};

	const canMove = (delta: number) =>
		groups.every((group) =>
			canMoveCanvasKeyframes({targets: group.targets, delta}),
		);

	return startCapturedPointerSession({
		event,
		captureTarget,
		onMove: (moveEvent) => {
			const clientXDelta = moveEvent.clientX - startClientX;
			if (!dragged && Math.abs(clientXDelta) < canvasKeyframeDragThresholdPx) {
				return;
			}

			if (moveTargets.length === 0 || pixelsPerFrame <= 0) {
				return;
			}

			moveEvent.preventDefault();
			const delta = getBoundedKeyframeDragDelta({
				delta: Math.round(clientXDelta / pixelsPerFrame),
				durationInFrames,
				targets: moveTargets,
			});
			if (dragged && delta === lastDelta) {
				return;
			}

			if (!dragged) {
				dragged = true;
				onDragStart?.();
			}

			lastDelta = delta;
			// A move that cannot be applied shows the keyframes at their original
			// positions until the pointer moves on.
			if (!canMove(delta)) {
				clearOverrides();
				onDragMove?.(0);
				return;
			}

			previewed = true;
			for (const group of groups) {
				overrides.set(
					group.nodePathInfo,
					group.key,
					getMovedCanvasKeyframeOverride({targets: group.targets, delta}),
				);
			}

			onDragMove?.(delta);
		},
		onEnd: (reason, endEvent) => {
			const released = isPointerSessionRelease(reason, endEvent);
			const moved =
				dragged && released && lastDelta !== 0 && canMove(lastDelta);
			if (!moved) {
				clearOverrides();
				onDragEnd({changes: [], delta: 0, dragged, released});
				return;
			}

			onDragEnd({
				changes: groups.map(
					(group): CanvasKeyframeChange => ({
						nodePathInfo: group.nodePathInfo,
						key: group.key,
						schema: group.schema,
						operation: {
							type: 'move',
							moves: group.targets.map((target) =>
								getCanvasKeyframeMove(target, lastDelta),
							),
						},
					}),
				),
				delta: lastDelta,
				dragged,
				released,
			});
		},
	});
};
