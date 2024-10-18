import type {PlayerRef} from '@remotion/player';
import React, {useEffect} from 'react';

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds - minutes * 60);
	return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
};

export const TimeDisplay: React.FC<{
	durationInFrames: number;
	fps: number;
	playerRef: React.RefObject<PlayerRef>;
}> = ({durationInFrames, fps, playerRef}) => {
	const [time, setTime] = React.useState(0);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onTimeUpdate = () => {
			setTime(current.getCurrentFrame());
		};

		current.addEventListener('frameupdate', onTimeUpdate);

		return () => {
			current.removeEventListener('frameupdate', onTimeUpdate);
		};
	}, [playerRef]);

	return (
		<div
			style={{
				fontFamily: 'monospace',
				fontSize: '14px',
				display: 'flex',
				gap: '8px',
			}}
		>
			<span>{formatTime(time / fps)}</span>
			<span style={{opacity: 0.6}}>/</span>
			<span style={{opacity: 0.6}}>{formatTime(durationInFrames / fps)}</span>
		</div>
	);
};
