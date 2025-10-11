import {useCallback, useEffect, useState} from 'react';
import {audioPlaybackRef} from '~/components/AudioPlayback';

export const useAudioPlayback = () => {
	const [playing, setPlaying] = useState(
		() => !(audioPlaybackRef.current?.paused ?? true),
	);
	const [time, setTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const seekToPercentage = useCallback((percentage: number) => {
		if (!audioPlaybackRef.current) {
			return;
		}

		audioPlaybackRef.current.currentTime =
			(percentage / 100) * (audioPlaybackRef.current.duration ?? 0);
	}, []);

	useEffect(() => {
		if (!audioPlaybackRef.current) {
			return;
		}

		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onTimeUpdate = () =>
			setTime(audioPlaybackRef.current?.currentTime ?? 0);
		const onDurationChange = () =>
			setDuration(audioPlaybackRef.current?.duration ?? 0);

		audioPlaybackRef.current.addEventListener('play', onPlay);
		audioPlaybackRef.current.addEventListener('pause', onPause);
		audioPlaybackRef.current.addEventListener('timeupdate', onTimeUpdate);
		audioPlaybackRef.current.addEventListener(
			'durationchange',
			onDurationChange,
		);
		return () => {
			audioPlaybackRef.current?.removeEventListener('play', onPlay);
			audioPlaybackRef.current?.removeEventListener('pause', onPause);
			audioPlaybackRef.current?.removeEventListener('timeupdate', onTimeUpdate);
			audioPlaybackRef.current?.removeEventListener(
				'durationchange',
				onDurationChange,
			);
		};
	}, []);

	return {playing, time, duration, seekToPercentage};
};
