import type React from 'react';
import {useEffect} from 'react';
import {Internals, useVideoConfig} from 'remotion';

export const FramePersistor: React.FC = () => {
	const playing = Internals.usePlaying();
	const config = useVideoConfig();
	const frame = Internals.Timeline.useTimelinePosition();
	const setFrameWithoutSeek = Internals.useTimelineSetFrameWithoutSeek();

	useEffect(() => {
		if (!playing) {
			setFrameWithoutSeek((f) => {
				const newObj = f[config.id] === frame ? f : {...f, [config.id]: frame};
				Internals.persistCurrentFrame(newObj);
				return newObj;
			});
		}
	}, [config.id, frame, playing, setFrameWithoutSeek]);
	return null;
};
