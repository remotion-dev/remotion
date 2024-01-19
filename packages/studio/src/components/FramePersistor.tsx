import type React from 'react';
import {useEffect} from 'react';
import {Internals, useVideoConfig} from 'remotion';

export const FramePersistor: React.FC = () => {
	const [playing] = Internals.Timeline.usePlayingState();
	const config = useVideoConfig();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrame = Internals.useTimelineSetFrame();

	useEffect(() => {
		if (!playing) {
			setFrame((f) => {
				const newObj = {...f, [config.id]: frame};
				Internals.persistCurrentFrame(newObj);
				return newObj;
			});
		}
	}, [config.id, frame, playing, setFrame]);
	return null;
};
