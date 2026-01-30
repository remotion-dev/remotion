import {ContactShadows, MeshDistortMaterial} from '@react-three/drei';
import {Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React, {useCallback, useEffect} from 'react';
import {
	AbsoluteFill,
	Img,
	Sequence,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';

const Orb: React.FC = () => {
	const frame = useCurrentFrame();
	const size = 1 + Math.sin(frame / 10);

	return (
		<>
			<ambientLight intensity={2.5} />
			<pointLight position-z={-15} intensity={1} color="#F8C069" />
			<mesh>
				<sphereGeometry args={[size, 128, 128]} />
				<MeshDistortMaterial
					color="black"
					envMapIntensity={1}
					clearcoat={1}
					clearcoatRoughness={0}
					metalness={0.1}
					// @ts-expect-error wrong types
					mass={4}
					tension={1000}
					friction={10}
				/>
			</mesh>
			<ContactShadows
				rotation={[Math.PI / 2, 0, 0]}
				position={[0, -1.6, 0]}
				opacity={0.8}
				width={15}
				height={15}
				blur={2.5}
				far={1.6}
			/>
		</>
	);
};

const OrbScene: React.FC = () => {
	const {height, width} = useVideoConfig();

	return (
		<ThreeCanvas
			width={width}
			height={height}
			gl={{
				alpha: false,
				antialias: false,
				stencil: false,
				depth: false,
			}}
			onCreated={(state) => state.gl.setClearColor('white')}
		>
			<ambientLight intensity={1.5} color={0xffffff} />
			<pointLight position={[10, 10, 0]} />
			<Orb />
		</ThreeCanvas>
	);
};

const Blur: React.FC = () => {
	const frame = useCurrentFrame();
	const blur = Math.sin(frame / 10) * 20 + 20;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Img
				style={{filter: `blur(${blur}px)`}}
				src="https://images.unsplash.com/photo-1696938944368-7abfb4233ded?auto=format&fit=crop&q=80&w=1740&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'sans-serif',
					fontSize: 80,
				}}
			>
				<h1>Blur</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Shadows: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = 1 + Math.sin(frame / 100) * 0.2;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			{new Array(10).fill(0).map((_, i) => (
				<AbsoluteFill
					key={i}
					style={{justifyContent: 'center', alignItems: 'center'}}
				>
					<div
						style={{
							height: 1700 - i * 180 * scale,
							width: 1700 - i * 180 * scale,
							borderRadius: '50%',
							position: 'absolute',
							backgroundColor: 'white',
							boxShadow: '0px 0px 50px 50px rgba(0, 0, 0, 0.1)',
						}}
					/>
				</AbsoluteFill>
			))}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'sans-serif',
					fontSize: 80,
				}}
			>
				<h1>Shadows</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const GpuScene: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: 'scale(0.5)', transformOrigin: '0 0'}}>
				<OrbScene />
			</AbsoluteFill>
			<AbsoluteFill
				style={{transform: 'scale(0.5)', transformOrigin: '0 100%'}}
			>
				<Shadows />
			</AbsoluteFill>
			<AbsoluteFill
				style={{transform: 'scale(0.5)', transformOrigin: '100% 100%'}}
			>
				<Blur />
			</AbsoluteFill>
			<AbsoluteFill
				style={{transform: 'scale(0.5)', transformOrigin: '100% 0%'}}
			>
				<Blur />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const MediaVideos: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: 'scale(0.5)', transformOrigin: '0 0'}}>
				<Video src="https://remotion.media/video-h264.mp4" />
			</AbsoluteFill>
			<AbsoluteFill
				style={{transform: 'scale(0.5)', transformOrigin: '100% 0'}}
			>
				<Video src="https://remotion.media/video-h265.mp4" />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					top: '50%',
					fontFamily: 'sans-serif',
					fontSize: 40,
				}}
			>
				<div>
					<p>Left: H.264 | Right: H.265</p>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const WebGLCheck: React.FC = () => {
	const {cancelRender} = useDelayRender();

	const check = useCallback(() => {
		let webglCanvas, webgl2Canvas;

		try {
			webglCanvas = new OffscreenCanvas(1, 1);
		} catch {
			cancelRender(new Error('OffscreenCanvas not available'));
			return;
		}

		try {
			webgl2Canvas = new OffscreenCanvas(1, 1);
		} catch {
			cancelRender(new Error('OffscreenCanvas not available'));
			return;
		}

		const gl1 = webglCanvas.getContext('webgl');
		if (!gl1) {
			cancelRender(new Error('WebGL not available'));
			return;
		}
		const gl2 = webgl2Canvas.getContext('webgl2');
		if (!gl2) {
			cancelRender(new Error('WebGL2 not available'));
			return;
		}
	}, [cancelRender]);

	useEffect(() => {
		check();
	}, [check]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontFamily: 'monospace',
				fontSize: 36,
				backgroundColor: '#1a1a2e',
				color: 'white',
			}}
		>
			<div style={{textAlign: 'center', lineHeight: 2}}>
				<h1 style={{fontSize: 60, marginBottom: 40}}>WebGL Check</h1>
			</div>
		</AbsoluteFill>
	);
};

const FPS = 30;
const DURATION_IN_FRAMES = 2 * 60 * FPS; // 2 minutes
const GPU_SCENE_DURATION = Math.floor(DURATION_IN_FRAMES / 3);
const MEDIA_DURATION = Math.floor(DURATION_IN_FRAMES / 3);
const WEBGL_DURATION = DURATION_IN_FRAMES - GPU_SCENE_DURATION - MEDIA_DURATION;

export const BrowserTest: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence durationInFrames={GPU_SCENE_DURATION}>
				<GpuScene />
			</Sequence>
			<Sequence from={GPU_SCENE_DURATION} durationInFrames={MEDIA_DURATION}>
				<MediaVideos />
			</Sequence>
			<Sequence
				from={GPU_SCENE_DURATION + MEDIA_DURATION}
				durationInFrames={WEBGL_DURATION}
			>
				<WebGLCheck />
			</Sequence>
		</AbsoluteFill>
	);
};
