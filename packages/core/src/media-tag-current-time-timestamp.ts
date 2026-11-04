import React from 'react';

export const useCurrentTimeOfMediaTag = (
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
) => {
	const currentTime: React.RefObject<{
		time: number;
	}> = React.useRef({
		time: mediaRef.current?.currentTime ?? 0,
	});

	const nowCurrentTime = mediaRef.current?.currentTime ?? null;
	if (nowCurrentTime !== null) {
		currentTime.current.time = nowCurrentTime;
	}

	return currentTime;
};
