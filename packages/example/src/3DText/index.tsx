import {
	deferRender,
	readyToRender,
	registerVideo,
	useCurrentFrame,
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
		[font]
	);

	const onResize = useCallback(() => {
		setSizeChange(Date.now());
	}, []);

	useEffect(() => {
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

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
		groupRef.current.rotation.x = 0.02 * frame;
	}, [frame]);

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
				backgroundColor: 'orange',
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
	durationInFrames: 100,
});
