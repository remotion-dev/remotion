import React from 'react';

export const useCurrentTimeOfMediaTagWithUpdateTimeStamp = (
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
) => {
	const lastUpdate: React.RefObject<{
		time: number;
		lastUpdate: number;
	}> = React.useRef({
		time: mediaRef.current?.currentTime ?? 0,
		lastUpdate: performance.now(),
	});

	const nowCurrentTime = mediaRef.current?.currentTime ?? null;
	if (nowCurrentTime !== null) {
		if (lastUpdate.current.time !== nowCurrentTime) {
			lastUpdate.current.time = nowCurrentTime;
			lastUpdate.current.lastUpdate = performance.now();
		}
	}

	return lastUpdate;
};
