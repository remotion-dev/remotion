import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import {useEffect, useState} from 'react';
import type {Player} from '../play-media';

export const PlayerQueue: React.FC<{
	player: Player;
}> = ({player}) => {
	const [queue, setQueue] = useState(() => player.frameDatabase.getGroups());

	useEffect(() => {
		const onQueueChanged = () => {
			setQueue(player.frameDatabase.getGroups());
		};

		player.frameDatabase.emitter.addEventListener(
			'queuechanged',
			onQueueChanged,
		);

		return () => {
			player.frameDatabase.emitter.removeEventListener(
				'queuechanged',
				onQueueChanged,
			);
		};
	}, [player]);

	return (
		<div style={{display: 'block', fontSize: 10}}>
			{queue.map((t) => (
				<div key={t.startingTimestamp}>
					{'gop'} {t.startingTimestamp}
					{t.frames.map((frame) => {
						return (
							<div key={frame.frame}>
								{(frame.frame / WEBCODECS_TIMESCALE).toFixed(2)},{' '}
								{frame.loopIndex}
							</div>
						);
					})}
					{'---'}
				</div>
			))}
		</div>
	);
};
