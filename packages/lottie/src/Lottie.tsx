import type {AnimationItem} from 'lottie-web';
import lottie from 'lottie-web';
import {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import type {LottieProps} from './types';
import {getLottieFrame} from './utils';
import {validateLoop} from './validate-loop';
import {validatePlaybackRate} from './validate-playbackrate';

/**
 * @description	Part of the @remotion/lottie package.
 * @see [Documentation](https://www.remotion.dev/docs/lottie/lottie)
 */
export const Lottie = ({
	animationData,
	className,
	direction,
	loop,
	playbackRate,
	style,
	onAnimationLoaded,
	renderer,
	preserveAspectRatio,
	assetsPath,
}: LottieProps) => {
	if (typeof animationData !== 'object') {
		throw new Error(
			'animationData should be provided as an object. If you only have the path to the JSON file, load it and pass it as animationData. See https://remotion.dev/docs/lottie/lottie#example for more information.',
		);
	}

	validatePlaybackRate(playbackRate);
	validateLoop(loop);

	const animationRef = useRef<AnimationItem | null>(null);
	const currentFrameRef = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const onAnimationLoadedRef =
		useRef<LottieProps['onAnimationLoaded']>(onAnimationLoaded);
	onAnimationLoadedRef.current = onAnimationLoaded;

	const [handle] = useState(() =>
		delayRender('Waiting for Lottie animation to load'),
	);
	const frame = useCurrentFrame();
	currentFrameRef.current = frame;

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

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
					currentFrame: currentFrameRef.current * (playbackRate ?? 1),
					direction,
					loop,
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
		};
	}, [
		animationData,
		assetsPath,
		direction,
		handle,
		loop,
		playbackRate,
		preserveAspectRatio,
		renderer,
	]);

	useEffect(() => {
		if (animationRef.current && direction) {
			animationRef.current.setDirection(direction === 'backward' ? -1 : 1);
		}
	}, [direction]);

	useEffect(() => {
		if (animationRef.current && playbackRate) {
			animationRef.current.setSpeed(playbackRate);
		}
	}, [playbackRate]);

	useEffect(() => {
		if (!animationRef.current) {
			return;
		}

		const {totalFrames} = animationRef.current;
		const frameToSet = getLottieFrame({
			currentFrame: frame * (playbackRate ?? 1),
			direction,
			loop,
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
	}, [direction, frame, loop, playbackRate]);

	return <div ref={containerRef} className={className} style={style} />;
};
