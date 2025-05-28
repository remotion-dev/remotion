import {useEffect, useState} from 'react';
import type {Player} from './play-video';
import {PlayPauseButton} from './ui/play-pause';
import {TimeDisplay} from './ui/TimeDisplay';

export const PlayerControls: React.FC<{
	player: Player;
	durationInSeconds: number | null;
}> = ({player, durationInSeconds}) => {
	const [playing, setPlaying] = useState(() => player.isPlaying());
	const [time, setTime] = useState(() => player.getCurrentTime());

	useEffect(() => {
		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		const onTimeUpdate = () => {
			setTime(player.getCurrentTime());
		};

		player.addEventListener('play', onPlay);
		player.addEventListener('pause', onPause);
		player.addEventListener('timeupdate', onTimeUpdate);

		return () => {
			player.removeEventListener('play', onPlay);
			player.removeEventListener('pause', onPause);
			player.removeEventListener('timeupdate', onTimeUpdate);
		};
	}, [player]);

	return (
		<div
			style={{
				width: '100%',
				height: 50,
				backgroundColor: 'white',
				borderTop: '2px solid black',
				flexDirection: 'row',
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<PlayPauseButton player={player} />
			<TimeDisplay player={player} durationInSeconds={durationInSeconds} />
		</div>
	);
};
