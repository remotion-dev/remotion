import {
	deferRender,
	readyToRender,
	registerVideo,
	spring,
	SpringConfig,
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
	LuminanceFormat,
	Mesh,
	NearestFilter,
	Vector3,
} from 'three';
import {bold} from './bold';

deferRender();

const diffuseColor = new Color().setRGB(0.2, 0.2, 0.2);

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
	const groupRef = useRef<JSX.IntrinsicElements['group']>(null);
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
	const config2 = useMemo(
		() => ({
			font,
			size: 80,
			height: 15,
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
			const s = new Vector3();
			self.geometry.computeBoundingBox();
			if (!self.geometry.boundingBox) {
				return null;
			}
			self.geometry.boundingBox.getSize(s);
			self.position.x = -s.x / 2;
			self.position.y = -s.y / 2;
			self.position.z = -s.z / 2;
		},
		[size]
	);
	const mesh2 = useUpdate<Mesh>(
		(self) => {
			const s = new Vector3();
			self.geometry.computeBoundingBox();
			if (!self.geometry.boundingBox) {
				return null;
			}
			self.geometry.boundingBox.getSize(s);
			self.position.x = -s.x / 2;
			self.position.y = -s.y / 2;
			self.position.z = -s.z / 2;
		},
		[size]
	);

	useEffect(() => {
		if (!groupRef.current) {
			return;
		}
		const springConfig: SpringConfig = {
			damping: 10,
			mass: 0.1,
			stiffness: 10,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: true,
		};
		// @ts-expect-error
		groupRef.current.rotation.x = spring({
			config: springConfig,
			frame,
			fps: videoConfig.fps,
			from: -Math.PI / 5,
			to: 0,
		});

		const scale = spring({
			config: springConfig,
			from: 0,
			to: 0.1,
			fps: videoConfig.fps,
			frame,
		});
		// @ts-expect-error
		groupRef.current.scale.x = scale;
		// @ts-expect-error
		groupRef.current.scale.y = scale;
	}, [frame, videoConfig.fps]);

	return (
		<group ref={groupRef} scale={[0.1, 0.1, 0.1]} position={[0, 0, 0]}>
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
			<mesh ref={mesh2}>
				<ambientLight intensity={2} />
				<pointLight
					position={[videoConfig.height / 2, videoConfig.height / 2, 0]}
				/>

				<textGeometry attach="geometry" args={['REACTYEAH', config2]} />
				<meshToonMaterial
					attach="material"
					//emissive={new Color(0xffffff)}
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
