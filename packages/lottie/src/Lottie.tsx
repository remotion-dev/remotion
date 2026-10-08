import type {AnimationItem} from 'lottie-web';
import lottie from 'lottie-web';
import {useLayoutEffect, useRef} from 'react';
import {
	Freeze,
	Sequence,
	Internals,
	useCurrentFrame,
	useDelayRender,
} from 'remotion';
import type {LottieProps} from './types';
import {getLottieFrame} from './utils';
import {validateLoop} from './validate-loop';
import {validatePlaybackRate} from './validate-playbackrate';

/**
 * @description	Part of the @remotion/lottie package.
 * @see [Documentation](https://www.remotion.dev/docs/lottie/lottie)
 */
const LottieContent = ({
	animationData,
	className,
	direction,
	style,
	onAnimationLoaded,
	renderer,
	preserveAspectRatio,
	assetsPath,
}: LottieProps) => {
	const animationRef = useRef<AnimationItem | null>(null);
	const currentFrameRef = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const onAnimationLoadedRef =
		useRef<LottieProps['onAnimationLoaded']>(onAnimationLoaded);
	onAnimationLoadedRef.current = onAnimationLoaded;
	const {delayRender, continueRender} = useDelayRender();

	const frame = useCurrentFrame();
	currentFrameRef.current = frame;

	useLayoutEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const handle = delayRender('Waiting for Lottie animation to load');
		animationRef.current = lottie.loadAnimation({
			container: containerRef.current,
			autoplay: false,
			animationData,
			assetsPath: assetsPath ?? undefined,
			renderer: renderer ?? 'svg',
			rendererSettings: {
				preserveAspectRatio: preserveAspectRatio ?? undefined,
			},
		});

		const {current: animation} = animationRef;
		const onComplete = () => {
			// Seek frame twice to avoid Lottie initialization bug:
			// See LottieInitializationBugfix composition in the example project for a repro.
			// We can work around it by seeking twice, initially.
			if (currentFrameRef.current) {
				const frameToSet = getLottieFrame({
					currentFrame: currentFrameRef.current,
					direction,
					totalFrames: animation.totalFrames,
				});
				animationRef.current?.goToAndStop(Math.max(0, frameToSet - 1), true);
				animationRef.current?.goToAndStop(frameToSet, true);
			}

			continueRender(handle);
		};

		animation.addEventListener('DOMLoaded', onComplete);

		onAnimationLoadedRef.current?.(animation);

		return () => {
			animation.removeEventListener('DOMLoaded', onComplete);
			animation.destroy();
			continueRender(handle);
		};
	}, [
		animationData,
		assetsPath,
		direction,
		preserveAspectRatio,
		renderer,
		continueRender,
		delayRender,
	]);

	useLayoutEffect(() => {
		if (animationRef.current && direction) {
			animationRef.current.setDirection(direction === 'backward' ? -1 : 1);
		}
	}, [direction]);

	useLayoutEffect(() => {
		if (!animationRef.current) {
			return;
		}

		const {totalFrames} = animationRef.current;
		const frameToSet = getLottieFrame({
			currentFrame: frame,
			direction,
			totalFrames,
		});

		animationRef.current.goToAndStop(frameToSet, true);
		const images = containerRef.current?.querySelectorAll(
			'image',
		) as NodeListOf<SVGImageElement>;
		images.forEach((img) => {
			const currentHref = img.getAttributeNS(
				'http://www.w3.org/1999/xlink',
				'href',
			);
			if (currentHref && currentHref === img.href.baseVal) {
				return;
			}

			const imgHandle = delayRender(
				`Waiting for lottie image with src="${img.href.baseVal}" to load`,
			);

			// https://stackoverflow.com/a/46839799
			img.addEventListener(
				'load',
				() => {
					continueRender(imgHandle);
				},
				{once: true},
			);

			img.setAttributeNS(
				'http://www.w3.org/1999/xlink',
				'xlink:href',
				img.href.baseVal as string,
			);
		});
	}, [direction, frame, delayRender, continueRender]);

	return <div ref={containerRef} className={className} style={style} />;
};

export const Lottie = ({
	animationData,
	from,
	durationInFrames,
	trimBefore,
	playbackRate,
	loop,
	freeze,
	hidden,
	name,
	showInTimeline,
	premountFor,
	postmountFor,
	styleWhilePremounted,
	styleWhilePostmounted,
	style,
	...props
}: LottieProps) => {
	if (typeof animationData !== 'object' || animationData === null) {
		throw new Error(
			'animationData should be provided as an object. If you only have the path to the JSON file, load it and pass it as animationData. See https://remotion.dev/docs/lottie/lottie#example for more information.',
		);
	}

	validatePlaybackRate(playbackRate);
	validateLoop(loop);

	// Match lottie-web's totalFrames so an implicit loop ends at the asset boundary.
	const sequenceDurationInFrames =
		loop && durationInFrames === undefined
			? Math.floor(
					animationData.op -
						(typeof animationData.ip === 'number' ? animationData.ip : 0),
				) - (trimBefore ?? 0)
			: durationInFrames;

	const {
		effectivePremountFor,
		effectivePostmountFor,
		freezeFrame,
		isPremountingOrPostmounting,
		premountingActive,
		postmountingActive,
		premountingStyle,
	} = Internals.usePremounting({
		from: from ?? 0,
		durationInFrames: Internals.resolveSequenceDuration({
			durationInFrames: sequenceDurationInFrames,
			playbackRate,
			loop,
		}),
		premountFor: premountFor ?? null,
		postmountFor: postmountFor ?? null,
		style: style ?? null,
		styleWhilePremounted: styleWhilePremounted ?? null,
		styleWhilePostmounted: styleWhilePostmounted ?? null,
		hideWhilePremounted: 'opacity',
	});
	return (
		<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
			<Sequence
				layout="none"
				from={from}
				durationInFrames={sequenceDurationInFrames}
				trimBefore={trimBefore}
				playbackRate={playbackRate}
				loop={loop}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<Lottie>'}
				showInTimeline={showInTimeline ?? false}
				_remotionInternalPremountDisplay={effectivePremountFor || null}
				_remotionInternalPostmountDisplay={effectivePostmountFor || null}
				_remotionInternalIsPremounting={premountingActive}
				_remotionInternalIsPostmounting={postmountingActive}
			>
				<LottieContent
					{...props}
					animationData={animationData}
					style={premountingStyle ?? undefined}
				/>
			</Sequence>
		</Freeze>
	);
};
