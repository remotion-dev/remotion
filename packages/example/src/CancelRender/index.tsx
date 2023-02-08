import React from 'react';
import {AbsoluteFill, cancelRender, useCurrentFrame} from 'remotion';

export const BaseRender: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				fontFamily: 'ubuntu',
				fontSize: '500',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#fff',
			}}
		>
			<h1>The current frame is {frame}</h1>
			<button
				type="button"
				style={{
					color: '#fff',
					height: '50px',
					width: '35%',
					fontSize: '22px',
					textAlign: 'center',
					borderRadius: '4px',
					backgroundColor: '#0b84f3',
					border: 'none',
				}}
				onClick={cancelRender}
			>
				Click me to cancel this render
			</button>
		</AbsoluteFill>
	);
};
