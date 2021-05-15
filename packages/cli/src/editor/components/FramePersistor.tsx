import React, {useEffect} from 'react';
import {Internals} from 'remotion';

export const getCurrentCompositionFromUrl = () => {
	return window.location.pathname.substr(1);
};

export const persistCurrentFrame = (frame: number) => {
	const currentComposition = getCurrentCompositionFromUrl();
	if (!currentComposition) {
		return;
	}

	localStorage.setItem(
		`remotion.time.${getCurrentCompositionFromUrl()}`,
		String(frame)
	);
};

export const FramePersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();

	useEffect(() => {
		if (!playing) {
			persistCurrentFrame(frame);
		}
	}, [frame, playing]);

	return null;
};
