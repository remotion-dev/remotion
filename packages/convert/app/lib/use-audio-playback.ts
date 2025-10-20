import type MediaFox from '@mediafox/core';
import {useCallback, useEffect, useState} from 'react';

export const useAudioPlayback = (mediaFox: MediaFox) => {
	const [playing, setPlaying] = useState(() => !mediaFox.paused);
	const [time, setTime] = useState(() => mediaFox.currentTime);
	const [duration, setDuration] = useState(() => mediaFox.duration);

	const seekToPercentage = useCallback(
		(percentage: number) => {
			mediaFox.currentTime = (percentage / 100) * mediaFox.duration;
		},
		[mediaFox],
	);

	useEffect(() => {
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onTimeUpdate = () => setTime(mediaFox.currentTime);
		const onDurationChange = () => setDuration(mediaFox.duration);

		mediaFox.on('play', onPlay);
		mediaFox.on('pause', onPause);
		mediaFox.on('timeupdate', onTimeUpdate);
		mediaFox.on('durationchange', onDurationChange);
		return () => {
			mediaFox.off('play', onPlay);
			mediaFox.off('pause', onPause);
			mediaFox.off('timeupdate', onTimeUpdate);
			mediaFox.off('durationchange', onDurationChange);
		};
	}, [mediaFox]);

	return {playing, time, duration, seekToPercentage};
};
