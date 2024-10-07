import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IsMutedIcon, NotMutedIcon} from '../../icons/arrows';
import styles from './player.module.css';

export const PlayerVolume: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	updateAudioVolume: (volume: number) => void;
	updateAudioMute: (isMuted: boolean) => void;
	audioState: {
		volume: number;
		isMuted: boolean;
	};
}> = ({playerRef, updateAudioMute, updateAudioVolume, audioState}) => {
	const containerRef = useRef<HTMLDivElement>(null);
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

	const [isDragging, setIsDragging] = useState(false);

	const calculatePosition = useCallback((clientY: number) => {
		const container = containerRef.current?.getBoundingClientRect();
		if (container) {
			const clickY = clientY - container.top;
			const relativePosition = 1 - clickY / container.height;
			return Math.max(0, Math.min(1, relativePosition)); // Ensure the value is between 0 and 1
		}

		return null;
	}, []);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) return; // Only respond to left mouse button
			setIsDragging(true);
			const position = calculatePosition(e.clientY);
			if (position === null) return;
			if (position < 0.05) {
				playerRef.current.mute();
				updateAudioVolume(0);
			} else {
				playerRef.current.unmute();
				updateAudioVolume(position);
			}
		},
		[calculatePosition, playerRef, updateAudioVolume],
	);

	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			if (!isDragging) return;
			const position = calculatePosition(e.clientY);
			if (position === null) return;
			if (position < 0.05) {
				playerRef.current.mute();
				updateAudioVolume(0);
			} else {
				playerRef.current.unmute();
				updateAudioVolume(position);
			}
		},
		[isDragging, calculatePosition, playerRef, updateAudioVolume],
	);

	const handlePointerUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('pointerup', handlePointerUp);
		}

		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [isDragging, handlePointerMove, handlePointerUp]);

	return (
		<div className={styles['volume-button']}>
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
			<div
				ref={containerRef}
				onPointerDown={handlePointerDown}
				className={styles['volume-bar']}
			>
				<div
					style={{
						height: '100%',
						width: '5px',
						position: 'relative',
						borderTopLeftRadius: '10px',
						borderTopRightRadius: '10px',
						overflow: 'hidden',
					}}
				>
					<div
						className={styles['volume-active']}
						style={{
							height: `${audioState.isMuted ? 0 : audioState.volume * 100}%`,
						}}
					/>
					<div className={styles['volume-background']} />
				</div>
			</div>
		</div>
	);
};
