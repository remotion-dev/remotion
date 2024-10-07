import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {IsMutedIcon, NotMutedIcon} from '../../icons/arrows';

export const PlayerVolume: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	updateAudioVolume: (volume: number) => void;
	updateAudioMute: (isMuted: boolean) => void;
	audioState: {
		volume: number;
		isMuted: boolean;
	};
}> = ({playerRef, updateAudioMute, audioState}) => {
	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onMutedChange = (e) => {
			updateAudioMute(e.detail.isMuted);
		};

		current.addEventListener('mutechange', onMutedChange);

		return () => {
			current.removeEventListener('mutechange', onMutedChange);
		};
	}, [playerRef, updateAudioMute]);

	const onClick = useCallback(() => {
		if (audioState.isMuted) {
			playerRef.current.unmute();
		} else {
			playerRef.current.mute();
		}
	}, [audioState, playerRef]);
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
			{audioState.isMuted ? (
				<IsMutedIcon style={{width: 20, opacity: 0.3}} />
			) : (
				<NotMutedIcon style={{width: 20}} />
			)}{' '}
		</button>
	);
};
