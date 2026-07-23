import React from 'react';
import {
	Freeze,
	Internals,
	Interactive,
	Sequence,
	useRemotionEnvironment,
	type EffectsProp,
	type InteractiveBaseProps,
	type InteractivePremountProps,
	type InteractiveTransformProps,
	type SequenceControls,
	type InteractivitySchema,
} from 'remotion';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';

const {useMemoizedEffectDefinitions, useMemoizedEffects} = Internals;

export type GifProps = InteractiveBaseProps &
	InteractivePremountProps &
	InteractiveTransformProps &
	RemotionGifProps & {
		readonly effects?: EffectsProp;
	};

/*
 * @description Displays a GIF that synchronizes with Remotions useCurrentFrame().
 * @see [Documentation](https://remotion.dev/docs/gif)
 */
export const gifSchema: InteractivitySchema = {
	...Internals.baseSchema,
	...Internals.premountSchema,
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
	...Interactive.borderSchema,
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
	from,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
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
	const refForOutline = React.useRef<HTMLElement | null>(null);
	const {
		effectivePostmountFor,
		effectivePremountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		postmountingActive,
		premountingActive,
		premountingStyle,
	} = Internals.usePremounting({
		from: from ?? 0,
		durationInFrames: durationInFrames ?? Infinity,
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'display-none',
	});

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
		style: premountingStyle ?? undefined,
		effects: memoizedEffects,
	};

	const inner = env.isRendering ? (
		<GifForRendering {...gifProps} ref={ref} />
	) : (
		<GifForDevelopment {...gifProps} ref={ref} refForOutline={refForOutline} />
	);

	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from ?? 0}
				durationInFrames={durationInFrames ?? Infinity}
				name="<Gif>"
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/gif/gif"
				controls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
				{...sequenceProps}
				outlineRef={refForOutline}
			>
				{inner}
			</Sequence>
		</Freeze>
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
