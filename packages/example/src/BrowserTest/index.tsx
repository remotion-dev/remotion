import {ContactShadows, MeshDistortMaterial} from '@react-three/drei';
import {Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React, {useCallback, useEffect} from 'react';
import {
	Img,
	Interactive,
	Track,
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

const BlurInner: React.FC = () => {
	const frame = useCurrentFrame();
	const blur = Math.sin(frame / 10) * 20 + 20;

	return (
		<>
			<Img
				name="Blurred photo"
				style={{filter: `blur(${blur}px)`}}
				src="https://images.unsplash.com/photo-1696938944368-7abfb4233ded?auto=format&fit=crop&q=80&w=1740&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'sans-serif',
					fontSize: 80,
				}}
			>
				<Interactive.H1 name="Blur label">Blur</Interactive.H1>
			</div>
		</>
	);
};

const Blur = Interactive.create({
	Component: BlurInner,
	layout: 'absolute-fill',
});

const ShadowsInner: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = 1 + Math.sin(frame / 100) * 0.2;

	return (
		<>
			{new Array(10).fill(0).map((_, i) => (
				<div
					key={i}
					style={{
						height: 1700 - i * 180 * scale,
						width: 1700 - i * 180 * scale,
						borderRadius: '50%',
						position: 'absolute',
						backgroundColor: 'white',
						boxShadow: '0px 0px 50px 50px rgba(0, 0, 0, 0.1)',
					}}
				/>
			))}
			<Interactive.H1 name="Shadows label" style={{position: 'relative'}}>
				Shadows
			</Interactive.H1>
		</>
	);
};

const Shadows = Interactive.create({
	Component: ShadowsInner,
	layout: 'absolute-fill',
});

const GpuSceneInner: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<>
			<ThreeCanvas
				name="WebGL orb"
				width={width}
				height={height}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					scale: 0.5,
					transformOrigin: '0 0',
				}}
				gl={{alpha: false, antialias: false, stencil: false, depth: false}}
				onCreated={(state) => state.gl.setClearColor('white')}
			>
				<ambientLight intensity={1.5} color={0xffffff} />
				<pointLight position={[10, 10, 0]} />
				<Orb />
			</ThreeCanvas>
			<Shadows
				name="Shadows"
				style={{
					scale: 0.5,
					transformOrigin: '0 100%',
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'sans-serif',
					fontSize: 80,
				}}
			/>
			<Blur
				name="Bottom right blur"
				style={{
					scale: 0.5,
					transformOrigin: '100% 100%',
					flexDirection: 'column',
				}}
			/>
			<Blur
				name="Top right blur"
				style={{
					scale: 0.5,
					transformOrigin: '100% 0%',
					flexDirection: 'column',
				}}
			/>
		</>
	);
};

const GpuScene = Interactive.create({
	Component: GpuSceneInner,
	layout: 'absolute-fill',
});

const MediaVideosInner: React.FC = () => {
	return (
		<>
			<Video
				name="H.264 video"
				src="https://remotion.media/video-h264.mp4"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					scale: 0.5,
					transformOrigin: '0 0',
				}}
			/>
			<Video
				name="H.265 video"
				src="https://remotion.media/video-h265.mp4"
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					scale: 0.5,
					transformOrigin: '100% 0',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					top: '50%',
					width: '100%',
					height: '100%',
					fontFamily: 'sans-serif',
					fontSize: 40,
				}}
			>
				<Interactive.P name="Codec labels">
					Left: H.264 | Right: H.265
				</Interactive.P>
			</div>
		</>
	);
};

const MediaVideos = Interactive.create({
	Component: MediaVideosInner,
	layout: 'absolute-fill',
});

const WebGLCheckInner: React.FC = () => {
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
		<>
			<div style={{textAlign: 'center', lineHeight: 2}}>
				<Interactive.H1
					name="WebGL label"
					style={{fontSize: 60, marginBottom: 40}}
				>
					WebGL Check
				</Interactive.H1>
			</div>
		</>
	);
};

const WebGLCheck = Interactive.create({
	Component: WebGLCheckInner,
	schema: {...Interactive.textSchema, ...Interactive.backgroundSchema},
	layout: 'absolute-fill',
});

const SystemFontCheckInner: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = Math.min(1, frame / 30);

	return (
		<>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 30,
					opacity,
				}}
			>
				<Interactive.H1
					name="System font heading"
					style={{
						fontFamily: 'sans-serif',
						fontSize: 120,
						color: 'black',
						fontWeight: 'bold',
						margin: 0,
					}}
				>
					System Font Test
				</Interactive.H1>
				<Interactive.P
					name="Serif sample"
					style={{
						fontFamily: 'serif',
						fontSize: 60,
						color: 'black',
						margin: 0,
					}}
				>
					Serif: The quick brown fox
				</Interactive.P>
				<Interactive.P
					name="Sans-serif sample"
					style={{
						fontFamily: 'sans-serif',
						fontSize: 60,
						color: 'black',
						margin: 0,
					}}
				>
					Sans-serif: jumps over the lazy dog
				</Interactive.P>
				<Interactive.P
					name="Monospace sample"
					style={{
						fontFamily: 'monospace',
						fontSize: 48,
						color: 'black',
						margin: 0,
					}}
				>
					Monospace: 0123456789 !@#$%
				</Interactive.P>
			</div>
		</>
	);
};

const SystemFontCheck = Interactive.create({
	Component: SystemFontCheckInner,
	schema: {...Interactive.backgroundSchema},
	layout: 'absolute-fill',
});

export const BrowserTest: React.FC = () => {
	return (
		<Track name="Browser checks">
			<SystemFontCheck
				name="System fonts"
				durationInFrames={900}
				style={{
					backgroundColor: 'white',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 40,
					overflow: 'visible',
				}}
			/>
			<GpuScene
				name="GPU effects"
				from={900}
				durationInFrames={900}
				style={{overflow: 'visible'}}
			/>
			<MediaVideos
				name="Video codecs"
				from={1800}
				durationInFrames={900}
				style={{overflow: 'visible'}}
			/>
			<WebGLCheck
				name="WebGL availability"
				from={2700}
				durationInFrames={900}
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontFamily: 'monospace',
					fontSize: 36,
					backgroundColor: '#1a1a2e',
					color: 'white',
					overflow: 'visible',
				}}
			/>
		</Track>
	);
};
