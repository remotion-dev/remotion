import type {CallbackListener, PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PALETTE} from '../layout/colors';
import {IsMutedIcon, NotMutedIcon} from './icons';

export const PlayerVolume: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const [muted, setIsMuted] = useState(
		() => playerRef.current?.isMuted() ?? true,
	);

	const [isHovered, setIsHovered] = useState(false);
	const timerRef = useRef<Timer | null>(null);

	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onMutedChange: CallbackListener<'mutechange'> = (e) => {
			setIsMuted(e.detail.isMuted);
		};

		current.addEventListener('mutechange', onMutedChange);

		return () => {
			current.removeEventListener('mutechange', onMutedChange);
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

		if (playerRef.current!.isMuted()) {
			playerRef.current!.unmute();
		} else {
			playerRef.current!.mute();
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
					color: PALETTE.TEXT_COLOR,
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
