import type React from 'react';
import {useContext, useEffect} from 'react';
import {Internals} from 'remotion';

export const getCurrentCompositionFromUrl = () => {
	return window.location.pathname.substr(1);
};

const makeKey = (composition: string) => {
	return `remotion.time.${composition}`;
};

export const persistCurrentFrame = (frame: number) => {
	const currentComposition = getCurrentCompositionFromUrl();
	if (!currentComposition) {
		return;
	}

	localStorage.setItem(makeKey(currentComposition), String(frame));
};

export const getFrameForComposition = (composition: string) => {
	const frame = localStorage.getItem(makeKey(composition));
	return frame ? Number(frame) : 0;
};

export const FramePersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const frame = Internals.Timeline.useTimelinePosition();

	const {currentComposition} = useContext(Internals.CompositionManager);
	const isActive = currentComposition === getCurrentCompositionFromUrl();

	useEffect(() => {
		if (!isActive) {
			return;
		}

		if (!playing) {
			persistCurrentFrame(frame);
		}
	}, [frame, isActive, playing]);

	return null;
};
