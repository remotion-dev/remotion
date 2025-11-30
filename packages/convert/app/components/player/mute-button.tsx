import type MediaFox from '@mediafox/core';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IsMutedIcon, NotMutedIcon} from './icons';

export const PlayerVolume: React.FC<{
	readonly playerRef: MediaFox;
}> = ({playerRef}) => {
	const [muted, setIsMuted] = useState(() => playerRef.muted);

	const [isHovered, setIsHovered] = useState(false);
	const timerRef = useRef<Timer | null>(null);

	useEffect(() => {
		const onMutedChange = () => {
			setIsMuted(playerRef.muted);
		};

		playerRef.on('volumechange', onMutedChange);

		return () => {
			playerRef.off('volumechange', onMutedChange);
		};
	}, [playerRef]);

	useEffect(() => {
		if (isHovered) {
			document.body.style.userSelect = 'none';
		} else {
			document.body.style.userSelect = 'auto';
		}
	}, [isHovered]);

	const onClick = useCallback(() => {
		if (timerRef.current !== null) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		if (playerRef.muted) {
			playerRef.muted = false;
		} else {
			playerRef.muted = true;
		}
	}, [playerRef]);

	return (
		<div
			className={'relative cursor-pointer block pl-4 pr-4 h-full'}
			onMouseEnter={() => setIsHovered(true)}
		>
			<button
				type="button"
				onClick={onClick}
				style={{
					background: 'transparent',
					border: 0,
					cursor: 'pointer',
					padding: 0,
					display: 'flex',
					height: 50,
					justifyContent: 'center',
					alignItems: 'center',
					color: 'black',
				}}
			>
				{muted ? (
					<IsMutedIcon style={{height: 20}} />
				) : (
					<NotMutedIcon style={{height: 20}} />
				)}
			</button>
		</div>
	);
};
