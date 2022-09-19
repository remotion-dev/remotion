import {useMemo} from 'react';
import {Internals, useCurrentFrame} from 'remotion';

export function useCurrentGifIndex(delays: number[]): number {
	const currentFrame = useCurrentFrame();
	const videoConfig = Internals.useUnsafeVideoConfig();

	const duration = useMemo(() => {
		if (delays.length !== 0) {
			return delays.reduce((sum: number, delay: number) => sum + delay, 0);
		}

		return 1;
	}, [delays]);

	const index = useMemo(() => {
		if (videoConfig && delays.length !== 0) {
			let currentTime = ((currentFrame / videoConfig.fps) * 1000) % duration;

			for (const [i, delay] of delays.entries()) {
				if (currentTime < delay) return i;

				currentTime -= delay;
			}
		}

		return 0;
	}, [delays, duration, currentFrame, videoConfig]);

	return index;
}
