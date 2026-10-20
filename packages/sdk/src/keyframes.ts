import type {
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusEasing,
	ExtrapolateType,
	InteractivitySchema,
	InteractivitySchemaField,
	InterpolateOutputOption,
} from 'remotion';
import {Internals} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from './get-timeline-sequence-sort-key';
import {
	getKeyframeDisplayOffset,
	getKeyframePlaybackRate,
	getKeyframeSourceFrame,
	getTimelineKeyframes,
} from './keyframe-frames';
import type {CanvasKeyframeMove} from './keyframe-move';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from './keyframe-navigation';
import {
	getCanvasKeyframeValueAtSourceFrame,
	getCanvasKeyframeValueToAdd,
	isCanvasKeyframablePropStatus,
} from './keyframe-value';

/** The timing of a track that places its keyframes on the composition timeline. */
export type CanvasKeyframeTrack = Pick<
	TimelineTrackData,
	'keyframeDisplayOffset' | 'keyframePlaybackRate'
>;

/** A keyframe of a prop, positioned in composition frames. */
export type CanvasKeyframe = {
	readonly frame: number;
	readonly value: unknown;
};

/** The easing between two adjacent keyframes, as `interpolate()` accepts it. */
export type CanvasKeyframeEasing = CanUpdateSequencePropStatusEasing;

/** The `extrapolateLeft` and `extrapolateRight` options of an interpolation. */
export type CanvasKeyframeClamping = {
	readonly left: ExtrapolateType;
	readonly right: ExtrapolateType;
};

/**
 * An edit of the keyframes of one prop. The frames are in the clock of the
 * interpolation, as `updateNodeKeyframes()` from @remotion/codemods expects.
 */
export type CanvasKeyframeOperation =
	| {
			/** Adds a keyframe, or replaces the value of the keyframe at `frame`. */
			readonly type: 'add';
			readonly frame: number;
			readonly value: unknown;
	  }
	| {
			readonly type: 'remove';
			readonly frame: number;
			/** The static value to write when the last keyframe is removed; `null` keeps the removed value. */
			readonly valueWhenLastKeyframeDeleted: unknown | null;
	  }
	| {
			readonly type: 'move';
			readonly moves: CanvasKeyframeMove[];
	  }
	| {
			/** Sets the easing of the segment between two adjacent keyframes. */
			readonly type: 'easing';
			readonly segmentIndex: number;
			readonly easing: CanvasKeyframeEasing;
	  }
	| {
			/** Writes the interpolation options. `undefined` leaves `clamping` and `output` unchanged and removes `posterize`. */
			readonly type: 'settings';
			readonly clamping: CanvasKeyframeClamping | undefined;
			readonly posterize: number | undefined;
			readonly output: InterpolateOutputOption | undefined;
	  };

export type CanvasKeyframeChange<
	Operation extends CanvasKeyframeOperation = CanvasKeyframeOperation,
> = {
	/** The registered source node of the sequence. */
	readonly nodePathInfo: SequenceNodePathInfo;
	/** The interactivity schema key in dot notation, e.g. `style.opacity`. */
	readonly key: string;
	/** The interactivity schema of the element, for the codemods. */
	readonly schema: InteractivitySchema;
	readonly operation: Operation;
};

/** The keyframes of a prop, placed on the composition timeline. */
export const getCanvasKeyframes = ({
	track,
	propStatus,
}: {
	readonly track: CanvasKeyframeTrack;
	readonly propStatus: CanUpdateSequencePropStatus | null;
}): CanvasKeyframe[] => {
	return getTimelineKeyframes(
		propStatus,
		track.keyframeDisplayOffset,
		track.keyframePlaybackRate,
	);
};

/**
 * Converts a composition frame to the frame clock of the prop's
 * interpolation, in which keyframe operations are expressed.
 */
export const getCanvasKeyframeSourceFrame = ({
	track,
	propStatus,
	frame,
}: {
	readonly track: CanvasKeyframeTrack;
	readonly propStatus: CanUpdateSequencePropStatus | null;
	readonly frame: number;
}): number => {
	return getKeyframeSourceFrame({
		displayFrame: frame,
		keyframeDisplayOffset: getKeyframeDisplayOffset({
			propStatus,
			keyframeDisplayOffset: track.keyframeDisplayOffset,
			keyframePlaybackRate: track.keyframePlaybackRate,
		}),
		keyframePlaybackRate: track.keyframePlaybackRate,
		propStatus,
	});
};

/** Converts a frame of the prop's interpolation to a composition frame. */
export const getCanvasKeyframeDisplayFrame = ({
	track,
	propStatus,
	sourceFrame,
}: {
	readonly track: CanvasKeyframeTrack;
	readonly propStatus: CanUpdateSequencePropStatus | null;
	readonly sourceFrame: number;
}): number => {
	return (
		sourceFrame /
			getKeyframePlaybackRate(propStatus, track.keyframePlaybackRate) +
		getKeyframeDisplayOffset({
			propStatus,
			keyframeDisplayOffset: track.keyframeDisplayOffset,
			keyframePlaybackRate: track.keyframePlaybackRate,
		})
	);
};

/** The schema field of a key in dot notation, including fields of enum variants. */
export const getSchemaField = (
	schema: InteractivitySchema,
	key: string,
): InteractivitySchemaField | undefined =>
	Internals.getFlatSchemaWithAllKeys(schema)[key];

const getSchemaFieldDefault = (
	schema: InteractivitySchema,
	key: string,
): unknown => {
	const field = getSchemaField(schema, key);
	return field !== undefined && 'default' in field ? field.default : undefined;
};

/**
 * The value a prop has at a composition frame according to the source: the
 * code value of a static prop, the interpolated value of a keyframed prop,
 * or the schema default when the prop is not set. `null` for computed props.
 */
export const getCanvasPropValueAtFrame = ({
	track,
	schema,
	key,
	propStatus,
	frame,
}: {
	readonly track: CanvasKeyframeTrack;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly frame: number;
}): unknown | null => {
	return getCanvasKeyframeValueAtSourceFrame({
		propStatus,
		sourceFrame: getCanvasKeyframeSourceFrame({track, propStatus, frame}),
		defaultValue: getSchemaFieldDefault(schema, key),
		dragOverrideValue: undefined,
	});
};

export type CanvasKeyframeToggle = {
	/** Whether keyframes can be added to the prop. */
	readonly keyframable: boolean;
	/** Whether the prop has a keyframe at the frame. */
	readonly hasKeyframe: boolean;
	/** The composition frame of the closest keyframe before the frame, if any. */
	readonly previousFrame: number | null;
	/** The composition frame of the closest keyframe after the frame, if any. */
	readonly nextFrame: number | null;
	/**
	 * Removes the keyframe at the frame, or adds one with the value the prop
	 * has there. `null` when the prop cannot be keyframed.
	 */
	readonly change: CanvasKeyframeChange | null;
};

/** Describes the keyframe button of a prop at a composition frame. */
export const getCanvasKeyframeToggle = ({
	nodePathInfo,
	track,
	schema,
	key,
	propStatus,
	frame,
	durationInFrames,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly track: CanvasKeyframeTrack;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly frame: number;
	readonly durationInFrames: number;
}): CanvasKeyframeToggle => {
	const keyframes = getCanvasKeyframes({track, propStatus});
	const sourceFrame = getCanvasKeyframeSourceFrame({track, propStatus, frame});
	const hasKeyframe =
		propStatus.status === 'keyframed' &&
		hasKeyframeAtSourceFrame(propStatus.keyframes, sourceFrame);
	const keyframable = isCanvasKeyframablePropStatus({propStatus, schema, key});
	const base = {nodePathInfo, key, schema};

	let change: CanvasKeyframeChange | null = null;
	if (hasKeyframe) {
		change = {
			...base,
			operation: {
				type: 'remove',
				frame: sourceFrame,
				valueWhenLastKeyframeDeleted: null,
			},
		};
	} else if (keyframable) {
		const value = getCanvasKeyframeValueToAdd({
			propStatus,
			schema,
			key,
			sourceFrame,
			defaultValue: getSchemaFieldDefault(schema, key),
			dragOverrideValue: undefined,
		});
		change =
			value === null
				? null
				: {...base, operation: {type: 'add', frame: sourceFrame, value}};
	}

	return {
		keyframable,
		hasKeyframe,
		previousFrame: getPreviousKeyframeDisplayFrame(
			keyframes,
			frame,
			durationInFrames,
		),
		nextFrame: getNextKeyframeDisplayFrame(keyframes, frame, durationInFrames),
		change,
	};
};
