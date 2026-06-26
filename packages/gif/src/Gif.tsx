import React from 'react';
import {
	Internals,
	Interactive,
	Sequence,
	useRemotionEnvironment,
	useVideoConfig,
	type EffectsProp,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type SequenceControls,
	type InteractivitySchema,
} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

const {
	addSequenceStackTraces,
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} = Internals;

export type GifProps = InteractiveBaseProps &
	InteractiveTransformProps &
	RemotionGifProps & {
		readonly effects?: EffectsProp;
	};

/*
 * @description Displays a GIF that synchronizes with Remotions useCurrentFrame().
 * @see [Documentation](https://remotion.dev/docs/gif)
 */
const gifSchema = {
	...Internals.baseSchema,
	playbackRate: {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.1,
		default: 1,
		description: 'Playback rate',
		hiddenFromList: false,
		keyframable: false,
	},
	...Internals.transformSchema,
} as const satisfies InteractivitySchema;

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
	requestInit,
	durationInFrames,
	style,
	controls,
	effects = [],
	ref,
	...sequenceProps
}: GifProps & {
	readonly controls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
}) => {
	const env = useRemotionEnvironment();
	const {durationInFrames: videoDuration} = useVideoConfig();
	const resolvedDuration = durationInFrames ?? videoDuration;
	const refForOutline = React.useRef<HTMLElement | null>(null);

	const memoizedEffectDefinitions = useMemoizedEffectDefinitions(effects);
	const memoizedEffects = useMemoizedEffects({
		effects,
		overrideId: controls?.overrideId ?? null,
	});

	const gifProps: RemotionGifProps & {
		readonly effects: typeof memoizedEffects;
	} = {
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
		requestInit,
		style,
		effects: memoizedEffects,
	};

	const inner = env.isRendering ? (
		<GifForRendering {...gifProps} ref={ref} />
	) : (
		<GifForDevelopment {...gifProps} ref={ref} refForOutline={refForOutline} />
	);

	return (
		<Sequence
			layout="none"
			durationInFrames={resolvedDuration}
			name="<Gif>"
			_remotionInternalDocumentationLink="https://www.remotion.dev/docs/gif/gif"
			controls={controls}
			_remotionInternalEffects={memoizedEffectDefinitions}
			{...sequenceProps}
			outlineRef={refForOutline}
		>
			{inner}
		</Sequence>
	);
};

export const Gif = Interactive.withSchema({
	Component: GifInner,
	componentName: '<Gif>',
	componentIdentity: 'dev.remotion.gif.Gif',
	schema: gifSchema,
	supportsEffects: true,
});

Gif.displayName = 'Gif';

addSequenceStackTraces(Gif);
