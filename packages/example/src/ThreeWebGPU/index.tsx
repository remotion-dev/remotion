import {ThreeWebGPUCanvas} from '@remotion/three/webgpu';
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const WebGPUShape: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const time = frame / fps;
	const scale = interpolate(Math.sin(time * 2), [-1, 1], [0.8, 1.2]);

	return (
		<mesh rotation={[time * 0.8, time * 1.1, time * 0.4]} scale={scale}>
			<torusKnotGeometry args={[1.1, 0.38, 220, 36]} />
			<meshStandardMaterial
				color={[
					Math.sin(time * 1.2) * 0.5 + 0.5,
					Math.cos(time * 0.9) * 0.5 + 0.5,
					Math.sin(time * 0.6) * 0.5 + 0.5,
				]}
				metalness={0.6}
				roughness={0.25}
			/>
		</mesh>
	);
};

export const ThreeWebGPU: React.FC = () => {
	const {height, width} = useVideoConfig();

	return (
		<ThreeWebGPUCanvas
			width={width}
			height={height}
			style={{backgroundColor: '#0b1020'}}
			camera={{fov: 60, position: [0, 0, 5]}}
		>
			<ambientLight intensity={0.4} />
			<directionalLight position={[5, 5, 5]} intensity={2.5} />
			<pointLight position={[-5, -3, 2]} intensity={30} color="#4f9dff" />
			<WebGPUShape />
		</ThreeWebGPUCanvas>
	);
};
