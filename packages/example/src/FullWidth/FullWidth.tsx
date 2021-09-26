import React from 'react';
import {useCurrentFrame} from 'remotion';
import './style.css';

export const FullWidth: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				width: '100vw',
				height: '100vh',
				backgroundImage: 'linear-gradient(black, white)',
			}}
		>
			<h1>
				{window.innerWidth} {frame}
			</h1>
		</div>
	);
};
