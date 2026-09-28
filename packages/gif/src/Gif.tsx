import React, {useEffect, useRef, useState} from 'react';
import {
	Freeze,
	Internals,
	Interactive,
	Sequence,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
	type EffectsProp,
	type InteractiveBaseProps,
	type InteractiveCropProps,
	type InteractivePremountProps,
	type InteractiveTransformProps,
	type SequenceControls,
	type InteractivitySchema,
} from 'remotion';
import {getGifDurationInSeconds} from './get-gif-duration-in-seconds';
import {GifForDevelopment} from './GifForDevelopment';
import {GifForRendering} from './GifForRendering';
import type {RemotionGifProps} from './props';
import {getGifCacheKey} from './request-init';
import {resolveGifSource} from './resolve-gif-source';

const {useMemoizedEffectDefinitions, useMemoizedEffects} = Internals;

export type GifProps = InteractiveBaseProps &
	InteractiveCropProps &
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
	...Internals.transformSchema,
	...Interactive.backgroundSchema,
	...Interactive.borderSchema,
	...Interactive.borderRadiusSchema,
	...Interactive.cropSchema,
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
	cropLeft,
	cropRight,
	cropTop,
	cropBottom,
	controls,
	effects = [],
	ref,
	...sequenceProps
}: GifProps & {
	readonly controls?: SequenceControls | undefined;
	readonly ref?: React.Ref<HTMLCanvasElement>;
}) => {
	const env = useRemotionEnvironment();
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
		durationInFrames: Internals.resolveSequenceDuration({
			durationInFrames,
			playbackRate,
			loop: sequenceProps.loop,
		}),
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'display-none',
	});
	const croppedStyle = Internals.useCropStyle({
		cropLeft,
		cropRight,
		cropTop,
		cropBottom,
		style: premountingStyle,
		componentName: '<Gif />',
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
		loopBehavior,
		id,
		delayRenderTimeoutInMilliseconds,
		requestInit,
		style: croppedStyle ?? undefined,
		effects: memoizedEffects,
	};

	const inner = env.isRendering ? (
		<GifForRendering {...gifProps} ref={ref} />
	) : (
		<GifForDevelopment {...gifProps} ref={ref} />
	);

	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from ?? 0}
				playbackRate={playbackRate}
				durationInFrames={durationInFrames}
				name="<Gif>"
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/gif/gif"
				controls={controls}
				_remotionInternalEffects={memoizedEffectDefinitions}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
				{...sequenceProps}
			>
				{inner}
			</Sequence>
		</Freeze>
	);
};

const GifWithIntrinsicDuration = (
	props: GifProps & {
		readonly controls?: SequenceControls | undefined;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	},
) => {
	const {fps} = useVideoConfig();
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const {src, requestInit, trimBefore} = props;
	const onErrorRef = useRef(props.onError);
	onErrorRef.current = props.onError;
	const requestInitRef = useRef(requestInit);
	requestInitRef.current = requestInit;
	const [handle] = useState(() =>
		delayRender(`Finding duration of <Gif src="${src}" />`, {
			timeoutInMilliseconds: props.delayRenderTimeoutInMilliseconds,
		}),
	);
	const [durationInFrames, setDurationInFrames] = useState<number | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		getGifDurationInSeconds(src, {requestInit: requestInitRef.current})
			.then((duration) => {
				if (!cancelled) {
					setDurationInFrames(Math.ceil(duration * fps) - (trimBefore ?? 0));
				}
			})
			.catch((error) => {
				if (cancelled) {
					return;
				}

				if (onErrorRef.current) {
					onErrorRef.current(error);
					setFailed(true);
				} else {
					cancelRender(error);
				}
			});

		return () => {
			cancelled = true;
			continueRender(handle);
		};
	}, [cancelRender, continueRender, fps, handle, src, trimBefore]);

	useEffect(() => {
		if (durationInFrames !== null || failed) {
			continueRender(handle);
		}
	}, [continueRender, durationInFrames, failed, handle]);

	if (durationInFrames === null || failed) {
		return null;
	}

	return <GifInner {...props} durationInFrames={durationInFrames} />;
};

const GifComponent = (
	props: GifProps & {
		readonly controls?: SequenceControls | undefined;
		readonly ref?: React.Ref<HTMLCanvasElement>;
	},
) => {
	if (props.loop && props.durationInFrames === undefined) {
		const resolvedSrc = resolveGifSource(props.src);
		const cacheKey = getGifCacheKey({
			resolvedSrc,
			requestInit: props.requestInit,
		});
		return (
			<GifWithIntrinsicDuration
				{...props}
				key={`${cacheKey}-${props.trimBefore ?? 0}`}
			/>
		);
	}

	return <GifInner {...props} />;
};

export const Gif = Interactive.withSchema({
	Component: GifComponent,
	componentName: '<Gif>',
	componentIdentity: 'dev.remotion.gif.Gif',
	schema: gifSchema,
	supportsEffects: true,
});

Gif.displayName = 'Gif';
