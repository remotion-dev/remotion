import type {
	CanUpdateSequencePropStatusKeyframed,
	ExtrapolateType,
	InteractivitySchema,
	InterpolateOutputOption,
} from 'remotion';
import type {SequenceNodePathInfo} from './get-timeline-sequence-sort-key';
import type {
	CanvasKeyframeChange,
	CanvasKeyframeClamping,
	CanvasKeyframeOperation,
} from './keyframes';

/** The interpolation options of a keyframed prop that an editor can change. */
export type CanvasKeyframeSettings = {
	/**
	 * How the prop extrapolates before the first and after the last keyframe.
	 * `null` when the interpolation function has no extrapolation options, as
	 * `interpolateColors()` does not.
	 */
	readonly clamping: CanvasKeyframeClamping | null;
	/**
	 * The extrapolation types the prop accepts; `interpolatePaths()` cannot use
	 * `identity`. Empty when `clamping` is `null`.
	 */
	readonly extrapolateTypes: readonly ExtrapolateType[];
	/** Samples the animation every `posterize` frames; `null` when the value changes on every frame. */
	readonly posterize: number | null;
	/**
	 * How the eased progress maps to the values. `null` when the interpolation
	 * function has no output modes; only `interpolate()` has them.
	 */
	readonly output: InterpolateOutputOption | null;
};

const extrapolateTypes = [
	'extend',
	'clamp',
	'identity',
	'wrap',
] as const satisfies readonly ExtrapolateType[];

/** Reads the interpolation options of a keyframed prop. */
export const getCanvasKeyframeSettings = (
	propStatus: CanUpdateSequencePropStatusKeyframed,
): CanvasKeyframeSettings => {
	const {interpolationFunction} = propStatus;
	const hasClamping =
		interpolationFunction === 'interpolate' ||
		interpolationFunction === 'interpolatePaths';
	const hasOutput = interpolationFunction === 'interpolate';

	return {
		clamping: hasClamping ? propStatus.clamping : null,
		extrapolateTypes: hasClamping
			? extrapolateTypes.filter((type) => hasOutput || type !== 'identity')
			: [],
		posterize: propStatus.posterize ?? null,
		output: hasOutput ? (propStatus.output ?? 'linear') : null,
	};
};

/**
 * The change that writes the interpolation options of a keyframed prop. Pass
 * the settings of `getCanvasKeyframeSettings()` with the values you changed.
 */
export const getCanvasKeyframeSettingsChange = ({
	nodePathInfo,
	schema,
	key,
	propStatus,
	settings,
}: {
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly schema: InteractivitySchema;
	readonly key: string;
	readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	readonly settings: CanvasKeyframeSettings;
}): CanvasKeyframeChange<
	Extract<CanvasKeyframeOperation, {readonly type: 'settings'}>
> => {
	const current = getCanvasKeyframeSettings(propStatus);

	return {
		nodePathInfo,
		key,
		schema,
		operation: {
			type: 'settings',
			clamping:
				current.clamping === null
					? undefined
					: (settings.clamping ?? current.clamping),
			posterize:
				settings.posterize === null || settings.posterize <= 0
					? undefined
					: settings.posterize,
			output:
				current.output === null
					? undefined
					: (settings.output ?? current.output),
		},
	};
};
