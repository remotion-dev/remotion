import type {PlayerRef, RenderCustomControls} from '@remotion/player';
import {Player} from '@remotion/player';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import CarSlideshow from './CarSlideshow';

const CustomButton: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);

		current.addEventListener('play', onPlay);
		current.addEventListener('pause', onPause);

		return () => {
			current.removeEventListener('play', onPlay);
			current.removeEventListener('pause', onPause);
		};
	}, [playerRef]);

	const handleClick = useCallback(() => {
		playerRef.current?.toggle();
	}, [playerRef]);

	return (
		<button
			type="button"
			onClick={handleClick}
			style={{
				background: 'rgba(255, 255, 255, 0.2)',
				border: 'none',
				borderRadius: '4px',
				padding: '4px 8px',
				color: 'white',
				cursor: 'pointer',
				fontSize: '12px',
			}}
		>
			{isPlaying ? 'Custom Pause' : 'Custom Play'}
		</button>
	);
};

export const CustomControlsExample: React.FC = () => {
	const playerRef = useRef<PlayerRef>(null);

	const renderCustomControls: RenderCustomControls = useCallback(() => {
		return <CustomButton playerRef={playerRef} />;
	}, []);

	return (
		<div>
			<h3>Custom Controls Example</h3>
			<p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
				The custom control is rendered between main controls and fullscreen
				button
			</p>
			<Player
				ref={playerRef}
				component={CarSlideshow}
				durationInFrames={500}
				compositionWidth={1920}
				compositionHeight={1080}
				fps={30}
				controls
				acknowledgeRemotionLicense
				renderCustomControls={renderCustomControls}
				inputProps={{
					title: 'Custom Controls Demo',
					bgColor: '#000',
					color: '#fff',
				}}
				style={{
					width: 400,
				}}
			/>
		</div>
	);
};
