import React from 'react';
import {useFrame, registerVideo} from '@jonny/motion-core';

export const Hey: React.FC = () => {
	const frame = useFrame();
	return (
		<div
			style={{
				background: 'linear-gradient(to bottom, #7AFFB5, #36D27A)',
				padding: 50,
				flex: 1,
				display: 'flex',
			}}
		>
			<div
				style={{
					flex: 1,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',

					backgroundColor: 'white',
					boxShadow: '0 2px 2px gray',
				}}
			>
				<div
					style={{
						fontSize: 100,
						fontFamily: 'Montserrat',
						fontWeight: 'bold',
					}}
				>
					{frame}
				</div>
			</div>
		</div>
	);
};

registerVideo(Hey, {
	fps: 60,
	height: 1080,
	width: 1080,
	frames: 10,
});
