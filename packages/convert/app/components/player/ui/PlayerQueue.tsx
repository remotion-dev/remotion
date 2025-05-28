import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {useEffect, useState} from 'react';
import type {Player} from '../play-media';

export const PlayerQueue: React.FC<{
	player: Player;
}> = ({player}) => {
	const [queue, setQueue] = useState(() => player.getBufferedTimestamps());

	useEffect(() => {
		const onQueueChanged = () => {
			setQueue(player.getBufferedTimestamps());
		};

		player.addEventListener('queuechanged', onQueueChanged);

		return () => {
			player.removeEventListener('queuechanged', onQueueChanged);
		};
	}, [player]);

	return (
		<div style={{display: 'block', fontSize: 10}}>
			{queue.map((t) => (
				<div key={t}>{(t / WEBCODECS_TIMESCALE).toFixed(2)}, </div>
			))}
		</div>
	);
};
