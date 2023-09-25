import type React from 'react';
import {useEffect} from 'react';
import {Internals, useVideoConfig} from 'remotion';

export const getCurrentCompositionFromUrl = () => {
	return window.location.pathname.substr(1);
};

export const getCurrentAssetFromUrl = () => {
	if (window.location.pathname.includes('assets')) {
		const substrings = window.location.pathname.split('/');
		const idx = substrings.indexOf('assets');
		if (substrings.length > idx + 1) {
			const path = substrings.slice(idx + 1).join('/');
			return path;
		}
	}

	return null;
};

export const FramePersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const config = useVideoConfig();
	const frame = Internals.Timeline.useTimelinePosition();

	useEffect(() => {
		if (!playing) {
			Internals.persistCurrentFrame(frame, config.id);
		}
	}, [config.id, frame, playing]);
	return null;
};
