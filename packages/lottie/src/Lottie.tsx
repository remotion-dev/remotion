import type {AnimationItem} from 'lottie-web';
import lottie from 'lottie-web';
import {useEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import type {LottieProps} from './types';
import {getNextFrame} from './utils';
import {validateLoop} from './validate-loop';
import {validatePlaybackRate} from './validate-playbackrate';

export const Lottie = ({
	animationData,
	className,
	direction,
	loop,
	playbackRate,
	style,
}: LottieProps) => {
	if (typeof animationData !== 'object') {
		throw new Error(
			'animationData should be provided as an object. If you only have the path to the JSON file, load it and pass it as animationData. See https://remotion.dev/docs/lottie/lottie#example for more information.'
		);
	}

	validatePlaybackRate(playbackRate);
	validateLoop(loop);

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
		const nextFrame = getNextFrame({
			currentFrame: frame * (playbackRate ?? 1),
			direction,
			loop,
			totalFrames,
		});

		animationRef.current.goToAndStop(nextFrame, true);
	}, [direction, frame, loop, playbackRate]);

	return <div ref={containerRef} className={className} style={style} />;
};
