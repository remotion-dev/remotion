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
import {
	Color,
	DataTexture,
	Font,
	Group,
	LuminanceFormat,
	Mesh,
	NearestFilter,
	Vector3,
} from 'three';
import {bold} from './bold';

deferRender();

const diffuseColor = new Color().setRGB(0.4, 0.4, 0.4);

const font = new Font(bold);
const Box: React.FC = () => {
	const colors = new Uint8Array(6);
	colors[0] = 0xffffff;
	colors[1] = 0xffffff;
	colors[2] = 0xffffff;
	colors[3] = 0x000000;
	colors[4] = 0x000000;
	colors[5] = 0x000000;

	const gradientMap = new DataTexture(
		colors,
		colors.length,
		1,
		LuminanceFormat
	);
	gradientMap.minFilter = NearestFilter;
	gradientMap.magFilter = NearestFilter;
	gradientMap.generateMipmaps = false;
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
			mass: 0.1,
			stiffness: 10,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			fps: videoConfig.fps,
			frame,
			velocity: 2,
		};
		groupRef.current.rotation.x = spring({
			...springConfig,
			from: -Math.PI / 5,
			to: 0,
		});

		const scale = spring({
			...springConfig,
			velocity: 0,
			from: 0,
			to: 0.1,
		});
		groupRef.current.scale.x = scale;
		groupRef.current.scale.y = scale;
	}, [frame, videoConfig.fps]);

	return (
		<group scale={[0.1, 0.1, 0.1]} position={[0, 0, 0]} ref={groupRef}>
			<mesh ref={mesh}>
				<ambientLight intensity={2} />
				<pointLight
					position={[videoConfig.height / 2, videoConfig.height / 2, 0]}
				/>

				<textGeometry attach="geometry" args={['REACTYEAH', config]} />
				<meshToonMaterial
					attach="material"
					color={diffuseColor}
					//emissive={new Color(0xffffff)}
					gradientMap={gradientMap}
					flatShading
				/>
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
