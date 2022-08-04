import type {AnimationItem} from 'lottie-web';
import lottie from 'lottie-web';
import type {CSSProperties} from 'react';
import {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import type {LottieAnimationData} from './types';
import {getNextFrame} from './utils';
import {validatePlaybackRate} from './validate-playbackrate';

export interface LottieProps {
	/**
	 * JSON object with the animation data.
	 * */
	animationData: LottieAnimationData;
	/**
	 * If the animation should loop after its end.
	 */
	loop?: boolean;
	/**
	 * The speed of the animation. Defaults to 1.
	 */
	playbackRate?: number;
	/**
	 * CSS classes to apply on the container of the animation.
	 */
	className?: string;
	/**
	 * CSS properties to apply on the container of the animation.
	 */
	style?: CSSProperties;
}

export const Lottie = ({
	animationData,
	className,
	loop,
	playbackRate = 1,
	style,
}: LottieProps) => {
	if (typeof animationData !== 'object') {
		throw new Error(
			'animationData should be provided as an object. If you only have the path to the JSON file, load it and pass it as animationData. See https://remotion.dev/link-tbd for more information.'
		);
	}

	validatePlaybackRate(playbackRate);

	const animationRef = useRef<AnimationItem>();
	const lastFrameRef = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [handle] = useState(() =>
		delayRender('Waiting for Lottie animation to load')
	);
	const frame = useCurrentFrame();

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		animationRef.current = lottie.loadAnimation({
			container: containerRef.current,
			autoplay: false,
			animationData,
		});

		if (lastFrameRef.current) {
			animationRef.current.goToAndStop(lastFrameRef.current, true);
		}

		const {current: animation} = animationRef;
		const onComplete = () => {
			continueRender(handle);
		};

		animation.addEventListener('DOMLoaded', onComplete);

		return () => {
			lastFrameRef.current = animation.currentFrame;
			animation.removeEventListener('DOMLoaded', onComplete);
			animation.destroy();
		};
	}, [animationData, handle]);

	useEffect(() => {
		if (!animationRef.current) {
			return;
		}

		animationRef.current.setSpeed(playbackRate);
	}, [playbackRate]);

	useEffect(() => {
		if (!animationRef.current) {
			return;
		}

		const {totalFrames} = animationRef.current;
		const expectedFrame = frame * playbackRate;
		const nextFrame = getNextFrame(expectedFrame, totalFrames, loop);

		animationRef.current.goToAndStop(nextFrame, true);
	}, [frame, loop, playbackRate]);

	return <div ref={containerRef} className={className} style={style} />;
};
