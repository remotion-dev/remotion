import {useTimelinePosition, useVideoConfig} from '@jonny/motion-core';
import React, {useCallback, useEffect, useState} from 'react';

export const PlayPause: React.FC = () => {
	const [playing, setPlaying] = useState(false);
	const [frame, setFrame] = useTimelinePosition();
	const config = useVideoConfig();

	const toggle = useCallback(() => {
		setPlaying((p) => !p);
	}, []);

	useEffect(() => {
		if (playing) {
			setTimeout(() => {
				const nextFrame = frame + 1;
				if (nextFrame >= config.durationInFrames) {
					console.log('resetting', Date.now());
					return setFrame(0);
				}
				setFrame(frame + 1);
			}, 1000 / config.fps);
		}
	}, [config.fps, config.durationInFrames, frame, playing, setFrame]);

	return (
		<button type="button" onClick={toggle}>
			{playing ? 'Pause' : 'Play'}
		</button>
	);
};
