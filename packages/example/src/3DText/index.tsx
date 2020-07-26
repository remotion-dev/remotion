import {
	deferRender,
	readyToRender,
	registerVideo,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React, {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Canvas, useUpdate} from 'react-three-fiber';
import {Font, Group, Mesh, Vector3} from 'three';
import {bold} from './bold';

deferRender();

const font = new Font(bold);
const Box: React.FC = () => {
	const groupRef = useRef<Group>(null);
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const [size, setSizeChange] = useState(Date.now());

	const config = useMemo(
		() => ({
			font,
			size: 80,
			height: 15,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 6,
			bevelSize: 2.5,
			bevelOffset: 0,
			bevelSegments: 8,
			color: '#fff',
		}),
		[]
	);

	const onResize = useCallback(() => {
		setSizeChange(Date.now());
	}, []);

	useEffect(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [onResize]);

	useEffect(() => {
		readyToRender();
	}, []);

	const mesh = useUpdate<Mesh>(
		(self) => {
			const size = new Vector3();
			self.geometry.computeBoundingBox();
			if (!self.geometry.boundingBox) {
				return null;
			}
			self.geometry.boundingBox.getSize(size);
			self.position.x = -size.x / 2;
			self.position.y = -size.y / 2;
			self.position.z = -size.z / 2;
		},
		[size]
	);

	useEffect(() => {
		if (!groupRef.current) {
			return;
		}
		const springConfig = {
			damping: 10,
			mass: 0.8,
			stiffness: 1000,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			fps: videoConfig.fps,
			frame,
			velocity: 1,
		};
		groupRef.current.rotation.x = spring({
			...springConfig,
			from: -Math.PI / 2,
			to: 0,
		});
		groupRef.current.rotation.y = spring({
			...springConfig,
			velocity: 0,
			from: 0,
			to: 0.1,
		});
		const scale = spring({
			...springConfig,
			velocity: 0,
			from: 0,
			to: 0.1,
		});
		groupRef.current.scale.x = scale;
		console.log({scale});
		groupRef.current.scale.y = scale;
	}, [frame, videoConfig.fps]);

	return (
		<group scale={[0.1, 0.1, 0.1]} position={[0, 0, 0]} ref={groupRef}>
			<mesh ref={mesh}>
				<textGeometry attach="geometry" args={['REACT', config]} />
				<meshNormalMaterial attach="material" />
			</mesh>
		</group>
	);
};

export const Hey: React.FC = () => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				background:
					'linear-gradient(-90deg, rgb(88, 81, 219), rgb(64, 93, 230))',
			}}
		>
			<Canvas camera={{position: [0, 0, 30], fov: 100}}>
				<ambientLight intensity={2} />
				<pointLight position={[40, 40, 40]} />
				<Suspense fallback={null}>
					<Box />
				</Suspense>
			</Canvas>
		</div>
	);
};

registerVideo(Hey, {
	fps: 60,
	height: 1080,
	width: 1080,
	durationInFrames: 200,
});
