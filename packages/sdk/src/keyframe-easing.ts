import {
	canEditEasingForInterpolationFunction,
	isInteractivitySchemaFieldHoldOnly,
	KEYFRAME_EASING_PRESETS,
	LINEAR_KEYFRAME_EASING,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusKeyframed,
	InteractivitySchema,
	InteractivitySchemaField,
} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import type {
	CanvasKeyframe,
	CanvasKeyframeChange,
	CanvasKeyframeEasing,
	CanvasKeyframeOperation,
	CanvasKeyframeTrack,
} from './keyframes';
import {getCanvasKeyframes, getSchemaField} from './keyframes';

export type CanvasKeyframeEasingPreset = {
	readonly id: string;
	readonly label: string;
	readonly easing: CanvasKeyframeEasing;
};

/** The easing presets of the Remotion Studio, starting with linear. */
export const canvasKeyframeEasingPresets: readonly CanvasKeyframeEasingPreset[] =
	[
		{id: 'linear', label: 'Linear', easing: LINEAR_KEYFRAME_EASING},
		...KEYFRAME_EASING_PRESETS,
	];

/** The span between two adjacent keyframes of a prop, in composition frames. */
export type KeyframeSegment = {
	/** Indexes the `easing` of the prop; the segment after the first keyframe has index 0. */
	readonly segmentIndex: number;
	/** The composition frame of the keyframe that starts the segment. */
	readonly fromFrame: number;
	/** The composition frame of the keyframe that ends the segment. */
	readonly toFrame: number;
};

/** The segment between two adjacent keyframes of a prop, on the composition timeline. */
export type CanvasKeyframeEasingSegment = KeyframeSegment & {
	/** The easing of the segment; linear when the source does not set one. */
	readonly easing: CanvasKeyframeEasing;
};

/** Pairs adjacent keyframes into the segments between them. */
export const getKeyframeSegments = (
	keyframes: readonly CanvasKeyframe[],
): KeyframeSegment[] => {
	return keyframes.flatMap((keyframe, index): KeyframeSegment[] => {
		const nextKeyframe = keyframes[index + 1];
		if (!nextKeyframe) {
			return [];
		}

		return [
			{
				segmentIndex: index,
				fromFrame: keyframe.frame,
				toFrame: nextKeyframe.frame,
			},
		];
	});
};

/** The easing of a segment; linear when the source does not set one. */
export const getKeyframeSegmentEasing = (
	propStatus: CanUpdateSequencePropStatusKeyframed,
	segmentIndex: number,
): CanvasKeyframeEasing =>
	propStatus.easing[segmentIndex] ?? LINEAR_KEYFRAME_EASING;

/**
 * Whether the easing between the keyframes of a prop can be edited. Boolean,
 * enum and integer fields hold their value until the next keyframe, and the
 * interpolation function must accept an easing.
 */
export const canEditKeyframeEasing = ({
	field,
	propStatus,
}: {
	readonly field: InteractivitySchemaField | undefined;
	readonly propStatus: CanUpdateSequencePropStatus | null | undefined;
}): boolean =>
	propStatus?.status === 'keyframed' &&
	!isInteractivitySchemaFieldHoldOnly(field) &&
	canEditEasingForInterpolationFunction(propStatus.interpolationFunction);

/**
 * The segments between the keyframes of a prop, placed on the composition
 * timeline. Empty when the easing of the prop cannot be edited.
 */
export const getCanvasKeyframeEasingSegments = ({
	track,
	schema,
	key,
	propStatus,
}: {
	readonly track: CanvasKeyframeTrack;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatus | null;
}): CanvasKeyframeEasingSegment[] => {
	if (
		propStatus?.status !== 'keyframed' ||
		!canEditKeyframeEasing({field: getSchemaField(schema, key), propStatus})
	) {
		return [];
	}

	return getKeyframeSegments(getCanvasKeyframes({track, propStatus})).map(
		(segment) => ({
			...segment,
			easing: getKeyframeSegmentEasing(propStatus, segment.segmentIndex),
		}),
	);
};

/**
 * The change that sets the easing of the segment between two adjacent
 * keyframes. `null` when the easing of the prop cannot be edited or the
 * segment does not exist.
 */
export const getCanvasKeyframeEasingChange = ({
	nodePathInfo,
	schema,
	key,
	propStatus,
	segmentIndex,
	easing,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly segmentIndex: number;
	readonly easing: CanvasKeyframeEasing;
}): CanvasKeyframeChange<
	Extract<CanvasKeyframeOperation, {readonly type: 'easing'}>
> | null => {
	if (
		propStatus.status !== 'keyframed' ||
		!canEditKeyframeEasing({field: getSchemaField(schema, key), propStatus}) ||
		!Number.isInteger(segmentIndex) ||
		segmentIndex < 0 ||
		segmentIndex >= propStatus.keyframes.length - 1
	) {
		return null;
	}

	return {
		nodePathInfo,
		key,
		schema,
		operation: {type: 'easing', segmentIndex, easing},
	};
};
