import React, {useEffect, useState} from 'react';
import {useVideoConfig} from 'remotion';
import {getLastFrames} from '../state/last-frames';

const label: React.CSSProperties = {
	color: 'white',
	fontFamily: 'Arial, Helvetica, sans-serif',
};

export const FpsCounter: React.FC = () => {
	const [now, setNow] = useState(0);
	const videoConfig = useVideoConfig();

	useEffect(() => {
		const t = setTimeout(() => {
			setNow(Date.now());
		}, 1000);
		return () => clearTimeout(t);
	}, [now]);

	const lastFrames = getLastFrames();
	if (lastFrames.length === 0) {
		return null;
	}

	const diff = Math.max(...lastFrames) - Math.min(...lastFrames);
	const avg = diff / lastFrames.length;
	const fps = 1000 / avg;
	return (
		<div
			style={{...label, color: fps < videoConfig.fps * 0.9 ? 'red' : 'white'}}
		>
			{String(fps.toFixed(1))} FPS
		</div>
	);
};
