import type React from 'react';
import {useEffect} from 'react';
import {Internals} from 'remotion';
import {loadPlaybackRate, persistPlaybackRate} from '../state/playbackrate';

export const PlaybackRatePersistor: React.FC = () => {
	const {setPlaybackRate, playbackRate} = Internals.usePlaybackRate();

	useEffect(() => {
		setPlaybackRate(loadPlaybackRate());
	}, [setPlaybackRate]);

	useEffect(() => {
		persistPlaybackRate(playbackRate);
	}, [playbackRate]);

	return null;
};
