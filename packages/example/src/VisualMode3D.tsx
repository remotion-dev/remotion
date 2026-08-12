import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const VisualMode3D: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#111', perspective: 800}}>
			<Sequence
				name="2D transform"
				durationInFrames={120}
				style={{height: 400, scale: 1, width: 400}}
			>
				<AbsoluteFill style={{backgroundColor: '#0b84ff'}} />
			</Sequence>
			<Sequence
				name="3D transform"
				durationInFrames={120}
				style={{
					height: 400,
					rotate: 'x 30deg',
					scale: '1 1 2',
					transformOrigin: '50% 50% 10px',
					translate: '500px 500px',
					width: 400,
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#ff4d8d'}} />
			</Sequence>
			<Sequence
				name="Tiny transform"
				durationInFrames={120}
				style={{
					height: 8,
					rotate: '0deg',
					scale: 1,
					translate: '100px 100px',
					width: 8,
				}}
			>
				<AbsoluteFill style={{backgroundColor: '#44cc88'}} />
			</Sequence>
		</AbsoluteFill>
	);
};
