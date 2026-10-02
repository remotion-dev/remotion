import {
	canMoveKeyframesWithoutCollisions,
	moveKeyframesInPropStatus,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
} from 'remotion';
import {
	getKeyframePlaybackRate,
	resolveKeyframeSourceFrame,
} from './keyframe-frames';

export type CanvasKeyframeMove = {
	readonly fromFrame: number;
	readonly toFrame: number;
};

/** A keyframe that is moved along the timeline. */
export type CanvasKeyframeMoveTarget = {
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	/** The keyframe in composition frames. */
	readonly displayFrame: number;
	/** The keyframe in the clock of the interpolation. */
	readonly sourceFrame: number;
	readonly keyframePlaybackRate: number;
};

/** Keeps every moved keyframe inside the composition. */
export const getBoundedKeyframeDragDelta = ({
	delta,
	durationInFrames,
	targets,
}: {
	readonly delta: number;
	readonly durationInFrames: number;
	readonly targets: readonly {readonly displayFrame: number}[];
}) => {
	if (targets.length === 0 || durationInFrames <= 0) {
		return 0;
	}

	const minDelta = Math.max(...targets.map((target) => -target.displayFrame));
	const maxDelta = Math.min(
		...targets.map((target) => durationInFrames - 1 - target.displayFrame),
	);

	return Math.min(Math.max(delta, minDelta), maxDelta);
};

/** Converts a movement in composition frames into a move of the source keyframe. */
export const getCanvasKeyframeMove = (
	target: CanvasKeyframeMoveTarget,
	delta: number,
): CanvasKeyframeMove => ({
	fromFrame: target.sourceFrame,
	toFrame: resolveKeyframeSourceFrame(
		target.sourceFrame +
			delta *
				getKeyframePlaybackRate(target.propStatus, target.keyframePlaybackRate),
		target.propStatus,
	),
});

/**
 * Whether the keyframes of one prop can be moved by `delta` frames: every
 * moved keyframe exists and no two moved keyframes end up on the same frame.
 * A keyframe that is not moved and lies on a destination frame is replaced.
 */
export const canMoveCanvasKeyframes = ({
	targets,
	delta,
}: {
	/** Keyframes of the same prop. */
	readonly targets: readonly CanvasKeyframeMoveTarget[];
	readonly delta: number;
}): boolean => {
	const [first] = targets;
	if (!first) {
		return true;
	}

	return canMoveKeyframesWithoutCollisions({
		status: first.propStatus,
		moves: targets.map((target) => getCanvasKeyframeMove(target, delta)),
	});
};

/** The keyframed status of a prop after moving some of its keyframes. */
export const getMovedCanvasKeyframeStatus = ({
	targets,
	delta,
}: {
	/** Keyframes of the same prop. */
	readonly targets: readonly CanvasKeyframeMoveTarget[];
	readonly delta: number;
}): CanUpdateSequencePropStatusKeyframed => {
	const [first] = targets;
	if (!first) {
		throw new Error('Expected a keyframe to move');
	}

	const moved = moveKeyframesInPropStatus({
		status: first.propStatus,
		moves: targets.map((target) => getCanvasKeyframeMove(target, delta)),
	});
	if (moved.status !== 'keyframed') {
		throw new Error('Expected keyframed status');
	}

	return moved;
};

/** Previews moved keyframes through a drag override. */
export const getMovedCanvasKeyframeOverride = ({
	targets,
	delta,
}: {
	readonly targets: readonly CanvasKeyframeMoveTarget[];
	readonly delta: number;
}): DragOverrideValue => ({
	type: 'keyframed',
	status: getMovedCanvasKeyframeStatus({targets, delta}),
});
