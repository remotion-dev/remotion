import type {WaveformVolume} from '@remotion/timeline-utils';
import type {CanUpdateSequencePropStatusKeyframed} from 'remotion';
import {Internals} from 'remotion';
import {
	getKeyframeDisplayOffset,
	getKeyframePlaybackRate,
} from './get-timeline-keyframes';

export type TimelineVolume =
	| WaveformVolume
	| {
			readonly points: readonly {
				readonly frame: number;
				readonly value: number;
			}[];
	  };

export const getTimelineVolume = ({
	status,
	displayDurationInFrames,
	firstDisplayFrame,
	keyframeDisplayOffset,
	keyframePlaybackRate,
}: {
	readonly status: CanUpdateSequencePropStatusKeyframed | null;
	readonly displayDurationInFrames: number;
	readonly firstDisplayFrame: number;
	readonly keyframeDisplayOffset: number;
	readonly keyframePlaybackRate: number;
}): TimelineVolume => {
	if (status === null) {
		return 1;
	}

	if (
		!Number.isFinite(displayDurationInFrames) ||
		displayDurationInFrames <= 0
	) {
		return [];
	}

	const resolvedDisplayOffset = getKeyframeDisplayOffset({
		propStatus: status,
		keyframeDisplayOffset,
		keyframePlaybackRate,
	});
	const resolvedPlaybackRate = getKeyframePlaybackRate(
		status,
		keyframePlaybackRate,
	);
	const evaluateVolume = Internals.prepareNumericKeyframedStatus({
		forceSpringAllowTail: null,
		status,
	});
	if (evaluateVolume === null) {
		return 1;
	}

	if (
		status.easing.every((easing) => easing.type === 'linear') &&
		status.posterize === undefined &&
		(status.output === undefined || status.output === 'linear') &&
		status.clamping.left !== 'identity' &&
		status.clamping.right !== 'identity' &&
		status.clamping.left !== 'wrap' &&
		status.clamping.right !== 'wrap' &&
		Number.isFinite(resolvedPlaybackRate) &&
		resolvedPlaybackRate > 0
	) {
		// Include the clip boundaries for clamping/extrapolation, and keep exact
		// keyframe positions even when playback rate puts them between frames.
		const frames = [
			0,
			...status.keyframes
				.map(
					(keyframe) =>
						keyframe.frame / resolvedPlaybackRate +
						resolvedDisplayOffset -
						firstDisplayFrame,
				)
				.filter((frame) => frame > 0 && frame < displayDurationInFrames),
			displayDurationInFrames,
		].sort((a, b) => a - b);
		const points: {frame: number; value: number}[] = [];
		let previousValue = 0;
		for (const frame of frames) {
			const value = evaluateVolume(
				(firstDisplayFrame + frame - resolvedDisplayOffset) *
					resolvedPlaybackRate,
			);
			if (value === null || !Number.isFinite(value)) {
				return 1;
			}

			const previousPoint = points.at(-1);
			if (previousPoint && previousValue * value < 0) {
				// Clamping negative volumes adds a corner where the line crosses zero.
				points.push({
					frame:
						previousPoint.frame +
						((frame - previousPoint.frame) * -previousValue) /
							(value - previousValue),
					value: 0,
				});
			}

			points.push({frame, value: Math.max(0, value)});
			previousValue = value;
		}

		return {points};
	}

	const curve: number[] = [];
	for (let index = 0; index < Math.ceil(displayDurationInFrames); index++) {
		const value = evaluateVolume(
			(firstDisplayFrame + index - resolvedDisplayOffset) *
				resolvedPlaybackRate,
		);
		if (value === null || !Number.isFinite(value)) {
			return 1;
		}

		curve.push(Math.max(0, value));
	}

	return curve;
};
