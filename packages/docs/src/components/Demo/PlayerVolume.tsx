import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';
import {IsMutedIcon, NotMutedIcon} from '../../icons/arrows';

export const PlayerVolume: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
}> = ({playerRef}) => {
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onMutedChange = (e) => {
			setIsMuted(e.detail.isMuted);
		};

		current.addEventListener('mutechange', onMutedChange);

		return () => {
			current.removeEventListener('mutechange', onMutedChange);
		};
	}, [playerRef]);

	const onClick = useCallback(() => {
		if (isMuted) {
			playerRef.current.unmute();
		} else {
			playerRef.current.mute();
		}
	}, [isMuted, playerRef]);
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				background: 'transparent',
				border: 0,
				cursor: 'pointer',
				padding: 0,
			}}
		>
			{isMuted ? (
				<IsMutedIcon style={{width: 20, opacity: 0.3}} />
			) : (
				<NotMutedIcon style={{width: 20}} />
			)}{' '}
		</button>
	);
};
