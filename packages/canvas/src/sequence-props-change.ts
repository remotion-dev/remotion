import type {CanUpdateSequencePropStatus, InteractivitySchema} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';

type CanvasSequencePropChangeBase = {
	/** The registered source node of the moved sequence. */
	readonly nodePathInfo: SequenceNodePathInfo;
	/** The interactivity schema key in dot notation, e.g. `style.translate`. */
	readonly key: string;
	readonly value: unknown;
	/** The interactivity schema of the element, for the codemods. */
	readonly schema: InteractivitySchema;
};

/** A prop value that a canvas gesture ended with. */
export type CanvasSequencePropChange =
	| (CanvasSequencePropChangeBase & {
			readonly type: 'static';
			/** The default of the schema field; the prop can be removed when `value` equals it. */
			readonly defaultValue: unknown;
	  })
	| (CanvasSequencePropChangeBase & {
			/** The prop is keyframed in the source; add or replace the keyframe at `frame`. */
			readonly type: 'keyframe';
			/** In the frame clock of the interpolation, as `updateNodeKeyframes()` expects. */
			readonly frame: number;
	  });

export type CanvasSequencePropsChangeHandler = (
	changes: readonly CanvasSequencePropChange[],
) => void;

/**
 * How the requested props of a sequence are written in the source, as
 * `getNodeProps()` from @remotion/codemods reports them. Return `null` when
 * the source is unknown.
 */
export type CanvasSequencePropStatusResolver = (
	nodePathInfo: SequenceNodePathInfo,
	keys: readonly string[],
) => Record<string, CanUpdateSequencePropStatus> | null;
