import React from 'react';
import {
	Internals,
	Sequence,
	useRemotionEnvironment,
	useVideoConfig,
	type SequenceControls,
	type SequenceProps,
	type SequenceSchema,
} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

export type GifProps = Omit<
	SequenceProps,
	'children' | 'durationInFrames' | 'layout'
> &
	RemotionGifProps & {
		readonly durationInFrames?: number;
	};

/*
 * @description Displays a GIF that synchronizes with Remotions useCurrentFrame().
 * @see [Documentation](https://remotion.dev/docs/gif)
 */
const gifSchema = {
	playbackRate: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.1,
		default: 1,
		description: 'Playback Rate',
	},
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Position',
	},
	'style.scale': {
		type: 'number',
		min: 0.05,
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation',
		step: 1,
		default: '0deg',
		description: 'Rotation',
	},
	'style.opacity': {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Opacity',
	},
} as const satisfies SequenceSchema;

const GifInner = ({
	src,
	width,
	height,
	onLoad,
	onError,
	fit,
	playbackRate,
	loopBehavior,
	id,
	delayRenderTimeoutInMilliseconds,
	durationInFrames,
	style,
	_experimentalControls: controls,
	ref,
	...sequenceProps
}: GifProps & {
	readonly _experimentalControls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
}) => {
	const env = useRemotionEnvironment();
	const {durationInFrames: videoDuration} = useVideoConfig();
	const resolvedDuration = durationInFrames ?? videoDuration;

	const gifProps: RemotionGifProps = {
		src,
		width,
		height,
		onLoad,
		onError,
		fit,
		playbackRate,
		loopBehavior,
		id,
		delayRenderTimeoutInMilliseconds,
		style,
	};

	const inner = env.isRendering ? (
		<GifForRendering {...gifProps} ref={ref} />
	) : (
		<GifForDevelopment {...gifProps} ref={ref} />
	);

	return (
		<Sequence
			layout="none"
			durationInFrames={resolvedDuration}
			name="<Gif>"
			_experimentalControls={controls}
			{...sequenceProps}
		>
			{inner}
		</Sequence>
	);
};

export const Gif = Internals.wrapInSchema(GifInner, gifSchema);

Gif.displayName = 'Gif';

Internals.addSequenceStackTraces(Gif);
