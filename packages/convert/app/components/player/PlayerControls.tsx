import type {Player} from './play-media';
import {PlayPauseButton} from './ui/play-pause';
import {TimeDisplay} from './ui/TimeDisplay';

export const PlayerControls: React.FC<{
	player: Player;
	durationInSeconds: number | null;
}> = ({player, durationInSeconds}) => {
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
