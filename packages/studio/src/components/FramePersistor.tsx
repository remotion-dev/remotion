import type React from 'react';
import {useEffect} from 'react';
import {Internals, useVideoConfig} from 'remotion';

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
