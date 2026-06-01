import type MediaFox from '@mediafox/core';
import React, {useEffect} from 'react';

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds - minutes * 60);
	return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
};

export const TimeDisplay: React.FC<{
	readonly playerRef: MediaFox;
}> = ({playerRef}) => {
	const [time, setTime] = React.useState(0);

	useEffect(() => {
		const onTimeUpdate = () => {
			setTime(playerRef.currentTime);
		};

		playerRef.on('timeupdate', onTimeUpdate);

		return () => {
			playerRef.off('timeupdate', onTimeUpdate);
		};
	}, [playerRef]);

	return (
		<div
			style={{
				fontSize: 16,
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			<span>{formatTime(time)}</span>
		</div>
	);
};
