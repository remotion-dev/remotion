import {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {GifLoopBehavior} from './props';

export function useCurrentGifIndex({
	delays,
	loopBehavior,
	playbackRate,
}: {
	delays: number[];
	loopBehavior: GifLoopBehavior;
	playbackRate: number;
}): number {
	const currentFrame = useCurrentFrame();
	const videoConfig = useVideoConfig();

	const duration = useMemo(() => {
		if (delays.length !== 0) {
			return delays.reduce(
				(sum: number, delay: number) => sum + (delay ?? 0),
				0,
			);
		}

		return 1;
	}, [delays]);

	if (delays.length === 0) {
		return 0;
	}

	const updatedFrame = currentFrame / (1 / playbackRate);

	const time = (updatedFrame / videoConfig.fps) * 1000;

	if (loopBehavior === 'pause-after-finish' && time >= duration) {
		return delays.length - 1;
	}

	if (loopBehavior === 'unmount-after-finish' && time >= duration) {
		return -1;
	}

	let currentTime = time % duration;

	for (let i = 0; i < delays.length; i++) {
		const delay = delays[i];
		if (currentTime < delay) {
			return i;
		}

		currentTime -= delay;
	}

	return 0;
}
