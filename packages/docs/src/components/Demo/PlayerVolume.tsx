import type {CallbackListener, PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IsMutedIcon, NotMutedIcon} from '../../icons/arrows';
import styles from './player.module.css';

export const PlayerVolume: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	setmountPlayerAudio: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({playerRef, setmountPlayerAudio}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	const [audioState, setAudioState] = useState({
		volume: 0.75,
		isMuted: true,
	});

	const [isHovered, setIsHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const timerRef = useRef<Timer | null>(null);

	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onMutedChange: CallbackListener<'mutechange'> = (e) => {
			setAudioState((v) => ({
				volume: v.volume === 0 ? 0.5 : v.volume, // if volume was previously 0, set it to 0.75
				isMuted: e.detail.isMuted,
			}));
			setmountPlayerAudio(true);
		};

		const volumeChangeListener: CallbackListener<'volumechange'> = (e) => {
			setAudioState((v) => ({
				volume: e.detail.volume,
				isMuted: v.isMuted,
			}));
			setmountPlayerAudio(true);
		};

		current.addEventListener('mutechange', onMutedChange);
		current.addEventListener('volumechange', volumeChangeListener);

		return () => {
			current.removeEventListener('mutechange', onMutedChange);
			current.removeEventListener('volumechange', volumeChangeListener);
		};
	}, [playerRef, setmountPlayerAudio]);

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

		if (audioState.isMuted) {
			playerRef.current.unmute();
		} else {
			playerRef.current.mute();
		}
	}, [audioState, playerRef]);

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
			if (timerRef.current !== null) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}

			setIsDragging(true);
			const position = calculatePosition(e.clientY);
			if (position === null) return;
			if (position < 0.05) {
				playerRef.current.mute();
				playerRef.current.setVolume(0);
			} else {
				playerRef.current.unmute();
				playerRef.current.setVolume(position);
			}
		},
		[calculatePosition, playerRef],
	);

	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			if (!isDragging) return;
			const position = calculatePosition(e.clientY);
			if (position === null) return;
			if (position < 0.05) {
				playerRef.current.mute();
				playerRef.current.setVolume(0);
			} else {
				playerRef.current.unmute();
				playerRef.current.setVolume(position);
			}
		},
		[isDragging, calculatePosition, playerRef],
	);

	const handlePointerUp = useCallback(() => {
		setIsDragging(false);
		timerRef.current = setTimeout(() => {
			setIsHovered(false);
		}, 1000);
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

	const handleMouseLeave = useCallback(() => {
		if (!isDragging) {
			setIsHovered(false);
		}
	}, [isDragging]);

	return (
		<div
			className={styles['volume-button']}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={handleMouseLeave}
		>
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
				style={{
					height: isHovered ? '80px' : '0px',
					opacity: isHovered ? 1 : 0,
				}}
			>
				<div
					style={{
						height: '100%',
						width: '8px',
						position: 'relative',
						borderRadius: '10px',
						borderTopRightRadius: '10px',
						overflow: 'hidden',
						border: '1px solid var(--ifm-font-color-base)',
					}}
				>
					<div
						className={`${styles['volume-active']} ${isDragging ? undefined : styles['animate-height']}`}
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
