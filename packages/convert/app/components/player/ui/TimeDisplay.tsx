import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import React, {useEffect} from 'react';
import type {Player} from '../play-video';

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds - minutes * 60);
	return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
};

export const TimeDisplay: React.FC<{
	readonly player: Player;
	readonly durationInSeconds: number | null;
}> = ({player, durationInSeconds}) => {
	const [time, setTime] = React.useState(() => player.getCurrentTime());

	useEffect(() => {
		const onTimeUpdate = () => {
			setTime(player.getCurrentTime());
		};

		player.addEventListener('timeupdate', onTimeUpdate);

		return () => {
			player.removeEventListener('timeupdate', onTimeUpdate);
		};
	}, [player]);

	return (
		<div
			style={{
				fontVariantNumeric: 'tabular-nums',
				paddingLeft: 14,
				fontSize: 15,
			}}
		>
			<span>{formatTime(time / WEBCODECS_TIMESCALE)}</span>
			{durationInSeconds ? (
				<span> / {formatTime(durationInSeconds)}</span>
			) : null}
		</div>
	);
};
