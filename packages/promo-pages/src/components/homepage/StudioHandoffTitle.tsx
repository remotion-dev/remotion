import React, {useEffect, useRef} from 'react';
import {Easing} from 'remotion';

// Midpoints and directions of the two-second slides in StudioCodeHandoff.
const transitions = [
	{midpoint: 3, from: 'programmatically', to: 'interactively', direction: 1},
	{midpoint: 6.5, from: 'interactively', to: 'agentically', direction: 1},
	{midpoint: 10, from: 'agentically', to: 'programmatically', direction: -1},
] as const;
const halfTransitionDuration = 0.2;
const transitionEasing = Easing.bezier(0.42, 0, 0.58, 1);

export const StudioHandoffTitle: React.FC<{
	readonly videoRef: React.RefObject<HTMLVideoElement | null>;
}> = ({videoRef}) => {
	const wordRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		const word = wordRef.current;
		if (!video || !word) {
			return;
		}

		let videoFrame: number | null = null;
		let animationFrame: number | null = null;
		let disposed = false;
		const supportsVideoFrames =
			typeof video.requestVideoFrameCallback === 'function';

		const update = (mediaTime: number) => {
			const time = mediaTime % 12;
			let text = 'programmatically';
			let opacity = 1;
			let offset = 0;

			for (const transition of transitions) {
				const start = transition.midpoint - halfTransitionDuration;
				const end = transition.midpoint + halfTransitionDuration;
				if (time < start) {
					break;
				}

				if (time >= end) {
					text = transition.to;
					continue;
				}

				const entering = time >= transition.midpoint;
				// Ease the entire motion once, so it keeps moving through the word swap.
				const progress = (time - start) / (end - start);
				const eased = transitionEasing(progress);
				text = entering ? transition.to : transition.from;
				opacity = Math.abs(2 * eased - 1);
				offset = transition.direction * 60 * (eased - (entering ? 1 : 0));
				break;
			}

			const content = `${text}.`;
			if (word.textContent !== content) {
				word.textContent = content;
			}

			word.style.opacity = String(opacity);
			word.style.transform = `translateX(${offset}px)`;
		};

		const onVideoFrame: VideoFrameRequestCallback = (_, metadata) => {
			if (disposed) {
				return;
			}

			update(metadata.mediaTime);
			videoFrame = video.requestVideoFrameCallback(onVideoFrame);
		};

		const onAnimationFrame = () => {
			animationFrame = null;
			if (disposed) {
				return;
			}

			update(video.currentTime);
			if (!video.paused) {
				animationFrame = requestAnimationFrame(onAnimationFrame);
			}
		};

		const sync = () => update(video.currentTime);
		const onPlay = () => {
			sync();
			if (!supportsVideoFrames && animationFrame === null) {
				animationFrame = requestAnimationFrame(onAnimationFrame);
			}
		};

		sync();
		if (supportsVideoFrames) {
			videoFrame = video.requestVideoFrameCallback(onVideoFrame);
		} else if (!video.paused) {
			animationFrame = requestAnimationFrame(onAnimationFrame);
		}

		video.addEventListener('loadedmetadata', sync);
		video.addEventListener('seeked', sync);
		video.addEventListener('pause', sync);
		video.addEventListener('play', onPlay);
		return () => {
			disposed = true;
			if (videoFrame !== null) {
				video.cancelVideoFrameCallback(videoFrame);
			}

			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}

			video.removeEventListener('loadedmetadata', sync);
			video.removeEventListener('seeked', sync);
			video.removeEventListener('pause', sync);
			video.removeEventListener('play', onPlay);
		};
	}, [videoRef]);

	return (
		<>
			Make videos{' '}
			<span style={{display: 'inline-grid', whiteSpace: 'nowrap'}}>
				<span aria-hidden style={{gridArea: '1 / 1', visibility: 'hidden'}}>
					programmatically.
				</span>
				<span ref={wordRef} style={{gridArea: '1 / 1'}}>
					programmatically.
				</span>
			</span>
		</>
	);
};
